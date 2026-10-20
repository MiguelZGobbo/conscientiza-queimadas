import importlib.util
import json
import tempfile
import unittest
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/importar-area.py'


class AreaImportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location('area', SCRIPT)
        cls.area = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.area)

    def series(self):
        months = self.area.month_range('2019-01', '2026-09')
        monthly = [{'year': int(key[:4]), 'month': int(key[5:]), 'areaHa': Decimal('1.01')} for key in months]
        annual = [{'year': year, 'areaHa': Decimal('1.01') * (9 if year == 2026 else 12)} for year in range(2019, 2027)]
        return {'monthly': monthly, 'annual': annual}

    def test_six_nonoverlapping_reference_windows_and_unrounded_average(self):
        data = self.series()
        data['monthly'][-1]['areaHa'] += Decimal('0.01')
        data['annual'][-1]['areaHa'] += Decimal('0.01')
        result = self.area.aggregate_series(data)
        self.assertEqual(result['areaLast12Months'], Decimal('12.13'))
        self.assertEqual(result['referenceTotals'], [Decimal('12.12')] * 6)
        self.assertEqual(result['referenceAverage'], Decimal('12.12'))

    def test_missing_month_duplicate_negative_and_divergent_annual_fail(self):
        for change in ['missing', 'duplicate', 'negative', 'annual', 'null']:
            with self.subTest(change=change):
                data = self.series()
                if change == 'missing': del data['monthly'][10]
                if change == 'duplicate': data['monthly'].append(data['monthly'][10].copy())
                if change == 'negative': data['monthly'][10]['areaHa'] = -1
                if change == 'annual': data['annual'][0]['areaHa'] = 999
                if change == 'null': data['monthly'][10]['areaHa'] = None
                with self.assertRaises(ValueError): self.area.aggregate_series(data)

    def test_zero_is_available_and_precision_is_preserved(self):
        data = self.series()
        for item in [*data['monthly'], *data['annual']]: item['areaHa'] = 0
        result = self.area.aggregate_series(data)
        self.assertEqual(result['areaLast12Months'], 0)
        self.assertEqual(result['referenceAverage'], 0)
        data = self.series()
        data['monthly'][9]['areaHa'] += Decimal('0.01')
        data['annual'][0]['areaHa'] += Decimal('0.01')
        result = self.area.aggregate_series(data)
        self.assertEqual(result['referenceAverage'], (Decimal('72.72') + Decimal('.01')) / 6)

    def test_new_month_in_source_does_not_change_pinned_period(self):
        data = self.series()
        data['monthly'].append({'year': 2026, 'month': 10, 'areaHa': Decimal('8.33')})
        data['annual'][-1]['areaHa'] += Decimal('8.33')
        result = self.area.aggregate_series(data)
        self.assertEqual(result['areaLast12Months'], Decimal('12.12'))

    def test_invalid_source_preserves_published_module(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); (root / 'src').mkdir()
            module = root / 'src/dados-base.js'; module.write_text('anterior', encoding='utf-8')
            with patch.object(self.area, 'fetch_sources', side_effect=ValueError('fonte incompleta')):
                self.assertEqual(self.area.main(['--output-dir', str(root)]), 1)
            self.assertEqual(module.read_text(encoding='utf-8'), 'anterior')

    def test_incomplete_payload_preserves_published_module(self):
        sources = {key: {'payload': self.series()} for key in self.area.source_definitions()}
        sources.update(years={'payload': list(range(2019, 2027))}, months={'payload': list(range(1, 10))})
        del sources['ES']['payload']['monthly'][20]
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); (root / 'src').mkdir()
            module = root / 'src/dados-base.js'; module.write_text('anterior', encoding='utf-8')
            with patch.object(self.area, 'fetch_sources', return_value=sources):
                self.assertEqual(self.area.main(['--output-dir', str(root)]), 1)
            self.assertEqual(module.read_text(encoding='utf-8'), 'anterior')


if __name__ == '__main__': unittest.main()
