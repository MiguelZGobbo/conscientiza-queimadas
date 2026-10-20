import importlib.util
import unittest
from decimal import Decimal
from pathlib import Path


def module(name):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).resolve().parents[1] / f'scripts/importar-{name}.py')
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


class HistoricalTests(unittest.TestCase):
    def test_area_reference_uses_calendar_years_and_excludes_2025(self):
        area = module('area')
        rows = [{'year': int(key[:4]), 'month': int(key[5:]), 'areaHa': Decimal(key[:4])} for key in area.month_range('2019-01', '2026-09')]
        annual = [{'year': year, 'areaHa': Decimal(year) * (9 if year == 2026 else 12)} for year in range(2019, 2027)]
        result = area.aggregate_series({'monthly': rows, 'annual': annual})
        self.assertEqual(result['referenceTotals'], [Decimal(year) * 12 for year in range(2019, 2025)])
        self.assertEqual(result['referenceAverage'], Decimal('24258'))

    def test_focus_history_and_cumulative_comparison_are_independent(self):
        focos = module('focos')
        counts = {key: int(key[:4]) - 2000 for key in focos.month_range('2003-01', '2026-09')}
        result = focos.historical_data({'BR': counts})['BR']
        self.assertEqual(len(result['annual']), 23)
        self.assertEqual(result['annual'][0], 36)
        self.assertEqual(result['annual'][-1], 300)
        self.assertEqual(result['monthly'], [25] * 3 + [26] * 9)
        self.assertEqual(result['cumulative'], [26 * month for month in range(1, 10)])
        self.assertEqual(result['historicalCumulative'], [14 * month for month in range(1, 10)])
        del counts['2003-02']
        with self.assertRaisesRegex(ValueError, 'incompleta'):
            focos.historical_data({'BR': counts})

    def test_reference_keeps_fractional_precision_and_real_zeros(self):
        focos = module('focos')
        counts = dict.fromkeys(focos.month_range('2003-01', '2026-09'), 0)
        counts['2003-01'] = 1
        result = focos.historical_data({'BR': counts})['BR']
        self.assertEqual(result['historicalCumulative'][0], 1 / 23)
        self.assertEqual(result['cumulative'], [0] * 9)

    def test_raf_rejects_missing_or_incompatible_table_before_generation(self):
        raf = module('area-historica')
        with self.assertRaises(ValueError): raf.parse_table(b'<p>Sem tabela</p>')



if __name__ == '__main__': unittest.main()
