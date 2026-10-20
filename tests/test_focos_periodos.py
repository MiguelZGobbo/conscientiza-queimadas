import csv
import importlib.util
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location('focos', Path(__file__).resolve().parents[1] / 'scripts/importar-focos.py')
focos = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(focos)


class MonthlyTests(unittest.TestCase):
    def source(self, root, rows):
        path = root / 'focos_mensal_br_202609.csv'
        with path.open('w', encoding='latin-1', newline='') as stream:
            writer = csv.DictWriter(stream, fieldnames=['id', 'lat', 'lon', 'data_hora_gmt', 'satelite', 'estado', 'estado_id', 'pais'])
            writer.writeheader()
            writer.writerows(rows)
        return path

    def row(self, identifier='a', satellite='AQUA_M-T'):
        return dict(id=identifier, lat='-20', lon='-40', data_hora_gmt='2026-09-01 12:00:00', satelite=satellite, estado='ESPÍRITO SANTO', estado_id='32', pais='Brasil')

    def test_filters_satellite_deduplicates_and_preserves_zero_states(self):
        with tempfile.TemporaryDirectory() as directory:
            path = self.source(Path(directory), [self.row(), self.row(), self.row('b', 'GOES-19')])
            data, audit = focos.validate_monthly({'2026-09': path}, ('2026-09',), require_daily_coverage=False)
        self.assertEqual(data['ES']['2026-09'], 1)
        self.assertEqual(data['BR']['2026-09'], 1)
        self.assertEqual(data['AC']['2026-09'], 0)
        self.assertEqual(audit['2026-09']['duplicates'], 1)

    def test_conflicts_dates_missing_month_and_coverage_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            changed = self.row(); changed['lon'] = '-41'
            path = self.source(Path(directory), [self.row(), changed])
            with self.assertRaisesRegex(ValueError, 'conflitante'):
                focos.validate_monthly({'2026-09': path}, ('2026-09',), require_daily_coverage=False)
            changed = self.row(); changed['data_hora_gmt'] = '2026-10-01 12:00:00'
            path = self.source(Path(directory), [changed])
            with self.assertRaisesRegex(ValueError, 'competência'):
                focos.validate_monthly({'2026-09': path}, ('2026-09',), require_daily_coverage=False)
            path = self.source(Path(directory), [self.row()])
            with self.assertRaisesRegex(ValueError, 'cobertura'):
                focos.validate_monthly({'2026-09': path}, ('2026-09',))
            with self.assertRaisesRegex(ValueError, 'ausente'):
                focos.validate_monthly({}, ('2026-09',))

    def test_days_without_reference_are_explicit_but_a_month_without_reference_fails(self):
        rows = [self.row(f'other-{day}', 'GOES-19') for day in range(1, 31)]
        for day, row in enumerate(rows, 1):
            row['data_hora_gmt'] = f'2026-09-{day:02d} 12:00:00'
        with tempfile.TemporaryDirectory() as directory:
            path = self.source(Path(directory), rows)
            with self.assertRaisesRegex(ValueError, 'referência ausente'):
                focos.validate_monthly({'2026-09': path}, ('2026-09',))
            path = self.source(Path(directory), [*rows, self.row()])
            _, audit = focos.validate_monthly({'2026-09': path}, ('2026-09',))
        self.assertEqual(audit['2026-09']['daysWithoutReferenceRecords'], list(range(2, 31)))

    def test_invalid_import_does_not_replace_existing_outputs(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'src').mkdir(); (root / 'docs').mkdir()
            target = root / 'src/focos-base.js'
            target.write_text('dados anteriores', encoding='utf-8')
            code = focos.main(['--input-dir', str(root), '--output-dir', str(root)])
            self.assertEqual(code, 1)
            self.assertEqual(target.read_text(encoding='utf-8'), 'dados anteriores')


if __name__ == '__main__':
    unittest.main()
