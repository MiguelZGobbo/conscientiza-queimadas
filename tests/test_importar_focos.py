import csv
import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "importar-focos.py"
SPEC = importlib.util.spec_from_file_location("importar_focos", SCRIPT)
importar_focos = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(importar_focos)


COLUMNS = [
    "id_bdq",
    "foco_id",
    "lat",
    "lon",
    "data_pas",
    "pais",
    "estado",
    "municipio",
    "bioma",
]


def row(year, month, focus_id, state="ACRE"):
    return {
        "id_bdq": f"{year}{month:02d}{focus_id}",
        "foco_id": focus_id,
        "lat": "-8.123456",
        "lon": "-70.123456",
        "data_pas": f"{year}-{month:02d}-01 12:00:00",
        "pais": "Brasil",
        "estado": state,
        "municipio": "RIO BRANCO",
        "bioma": "Amazônia",
    }


class ImportarFocosTests(unittest.TestCase):
    def write_inputs(self, root, rows_by_year):
        paths = {}
        for year, rows in rows_by_year.items():
            path = root / f"focos_br_ref_{year}.csv"
            with path.open("w", encoding="utf-8", newline="") as csv_file:
                writer = csv.DictWriter(csv_file, fieldnames=COLUMNS)
                writer.writeheader()
                writer.writerows(rows)
            paths[year] = path
        return paths

    def valid_rows(self):
        return {
            year: [row(year, 1, f"id-{year}"), row(year, 10, f"es-{year}", "ESPÍRITO SANTO")]
            for year in importar_focos.YEARS
        }

    def test_aggregates_brazil_states_and_months_for_all_23_years(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            paths = self.write_inputs(Path(temporary_directory), self.valid_rows())

            data, audit = importar_focos.validate_and_aggregate(
                paths,
                years=importar_focos.YEARS,
                expected_totals={year: 2 for year in importar_focos.YEARS},
            )

        self.assertEqual(data["BR"]["annual"], [2] * 23)
        self.assertEqual(data["BR"]["monthly"]["2025-01"], 1)
        self.assertEqual(data["BR"]["monthly"]["2025-10"], 1)
        self.assertEqual(data["AC"]["annual"], [1] * 23)
        self.assertEqual(data["ES"]["annual"], [1] * 23)
        self.assertEqual(data["AL"]["annual"], [0] * 23)
        self.assertEqual(len(data), 28)
        self.assertEqual(audit[2025]["monthly"], [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0])

    def test_rejects_duplicate_focus_ids_without_deduplicating(self):
        rows_by_year = self.valid_rows()
        rows_by_year[2021].append(row(2021, 2, "id-2021"))

        with tempfile.TemporaryDirectory() as temporary_directory:
            paths = self.write_inputs(Path(temporary_directory), rows_by_year)
            with self.assertRaisesRegex(ValueError, "foco_id duplicado"):
                importar_focos.validate_and_aggregate(
                    paths,
                    years=importar_focos.YEARS,
                    expected_totals={year: 2 for year in importar_focos.YEARS},
                )

    def test_rejects_unknown_state_names(self):
        rows_by_year = self.valid_rows()
        rows_by_year[2022][0]["estado"] = "ESTADO DESCONHECIDO"

        with tempfile.TemporaryDirectory() as temporary_directory:
            paths = self.write_inputs(Path(temporary_directory), rows_by_year)
            with self.assertRaisesRegex(ValueError, "estado desconhecido"):
                importar_focos.validate_and_aggregate(
                    paths,
                    years=importar_focos.YEARS,
                    expected_totals={year: 2 for year in importar_focos.YEARS},
                )

    def test_missing_optional_context_is_audited_without_losing_valid_state(self):
        rows = self.valid_rows()
        rows[2004][0]['bioma'] = ''
        rows[2004][0]['municipio'] = ''
        with tempfile.TemporaryDirectory() as directory:
            paths = self.write_inputs(Path(directory), rows)
            data, audit = importar_focos.validate_and_aggregate(paths, expected_totals={year: 2 for year in importar_focos.YEARS})
        self.assertEqual(data['AC']['annual'][1], 1)
        self.assertEqual(audit[2004]['missingContextFields'], {'bioma': 1, 'municipio': 1})

    def test_incomplete_national_monthly_coverage_is_rejected_in_production(self):
        with tempfile.TemporaryDirectory() as directory:
            paths = self.write_inputs(Path(directory), self.valid_rows())
            with self.assertRaisesRegex(ValueError, 'cobertura mensal'):
                importar_focos.validate_and_aggregate(paths, expected_totals=None, require_monthly_coverage=True)

    def test_rejects_missing_fields_and_dates_outside_file_year(self):
        rows_by_year = self.valid_rows()
        rows_by_year[2023][0]["estado"] = " "

        with tempfile.TemporaryDirectory() as temporary_directory:
            paths = self.write_inputs(Path(temporary_directory), rows_by_year)
            with self.assertRaisesRegex(ValueError, "valor ausente.*estado"):
                importar_focos.validate_and_aggregate(
                    paths,
                    years=importar_focos.YEARS,
                    expected_totals={year: 2 for year in importar_focos.YEARS},
                )

        rows_by_year = self.valid_rows()
        rows_by_year[2024][0]["data_pas"] = "2023-01-01 12:00:00"
        with tempfile.TemporaryDirectory() as temporary_directory:
            paths = self.write_inputs(Path(temporary_directory), rows_by_year)
            with self.assertRaisesRegex(ValueError, "data_pas fora do ano"):
                importar_focos.validate_and_aggregate(
                    paths,
                    years=importar_focos.YEARS,
                    expected_totals={year: 2 for year in importar_focos.YEARS},
                )

    def test_rejects_partial_annual_totals(self):
        rows_by_year = self.valid_rows()
        rows_by_year[2025] = rows_by_year[2025][:1]

        with tempfile.TemporaryDirectory() as temporary_directory:
            paths = self.write_inputs(Path(temporary_directory), rows_by_year)
            with self.assertRaisesRegex(ValueError, "total anual divergente"):
                importar_focos.validate_and_aggregate(
                    paths,
                    years=importar_focos.YEARS,
                    expected_totals={year: 2 for year in importar_focos.YEARS},
                )


if __name__ == "__main__":
    unittest.main()
