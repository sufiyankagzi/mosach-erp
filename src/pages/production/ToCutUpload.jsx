import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  MdCloudUpload, MdCheckCircle, MdError, MdRefresh,
  MdKeyboardArrowUp, MdKeyboardArrowDown, MdSearch,
} from 'react-icons/md';

const API_BASE_URL = 'https://mosach-erp-server.onrender.com/api/tocut-report';
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const columns = [
  ['sku', 'SKU'],
  ['tocut', 'To Cut'],
  ['article', 'Article'],
  ['colour', 'Colour'],
  ['size', 'Size'],
];

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  return [];
};

const errorText = (error) => {
  const data = error.response?.data;
  if (data?.message) return data.error ? `${data.message} ${data.error}` : data.message;
  if (error.code === 'ECONNABORTED') return 'Request timeout ho gaya. Dobara try karein.';
  if (!error.response) return 'Server se connection nahi ho raha. Internet aur Render API check karein.';
  return error.message || 'Unexpected error occurred.';
};

export default function ToCutUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('sku');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchReport = useCallback(async () => {
    setReportLoading(true);
    setError('');
    try {
      const response = await axios.get(API_BASE_URL, { timeout: 120000 });
      if (response.data?.success === false) throw new Error(response.data.message || 'To Cut report load nahi hua.');
      setRows(getRows(response.data));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleFile = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(null); setError(''); setMessage(''); setResult(null);
    if (!selected) return;
    if (!/\.(xlsx|xls)$/i.test(selected.name)) {
      setError('Sirf .xlsx ya .xls Excel file select karein.'); event.target.value = ''; return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('Excel file ka size maximum 10 MB hona chahiye.'); event.target.value = ''; return;
    }
    setFile(selected);
  };

  const upload = async (event) => {
    event.preventDefault();
    if (!file) { setError('Pehle Excel file select karein.'); return; }
    setLoading(true); setError(''); setMessage(''); setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, { timeout: 120000 });
      const payload = response.data;
      if (!payload || payload.success !== true) throw new Error(payload?.message || 'To Cut Excel upload failed.');
      setResult({ ...payload, fileName: file.name });
      setMessage(payload.message || 'To Cut Excel successfully upload ho gayi.');
      setFile(null);
      const input = document.getElementById('tocut-file');
      if (input) input.value = '';
      await fetchReport();
      setPage(1);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    let list = [...rows];
    const query = search.trim().toLowerCase();
    if (query) list = list.filter((row) => columns.some(([key]) => String(row[key] ?? '').toLowerCase().includes(query)));
    list.sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      const an = Number(av); const bn = Number(bv);
      const numeric = av !== '' && bv !== '' && Number.isFinite(an) && Number.isFinite(bn);
      const comparison = numeric ? an - bn : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [rows, search, sortField, sortDirection]);

  useEffect(() => { setPage(1); }, [search, pageSize]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (field) => {
    if (sortField === field) setSortDirection((value) => value === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const resetFilters = () => { setSearch(''); setSortField('sku'); setSortDirection('asc'); setPage(1); };

  const summary = [
    { title: 'Rows Read', value: result?.totalExcelRows ?? 0, style: 'bg-slate-100 text-slate-800' },
    { title: 'Unique SKU', value: result?.uniqueSkuCount ?? 0, style: 'bg-slate-100 text-slate-800' },
    { title: 'Inserted', value: result?.insertedRows ?? 0, style: 'bg-emerald-50 text-emerald-800' },
    { title: 'Updated', value: result?.updatedRows ?? 0, style: 'bg-blue-50 text-blue-800' },
    { title: 'Skipped', value: result?.skippedRows ?? 0, style: 'bg-amber-50 text-amber-800' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">To Cut Excel Upload</h1>
          <p className="mt-1 text-sm text-slate-500">Upload To Cut Excel, save SKU-wise records in MOSACH ERP, and review database records.</p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <form onSubmit={upload}>
            <label htmlFor="tocut-file" className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-orange-400 hover:bg-orange-50">
              <MdCloudUpload size={44} className="mb-2 text-orange-500" />
              <span className="font-semibold text-slate-700">Excel file select karne ke liye click karein</span>
              <span className="mt-1 text-sm text-slate-500">XLS / XLSX · Maximum 10 MB</span>
              <input id="tocut-file" type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
            </label>
            {file && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</p>}
            {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><MdError size={20} className="shrink-0" /><span className="break-words">{error}</span></div>}
            {message && <div role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><MdCheckCircle size={20} className="shrink-0" /><span>{message}</span></div>}
            <div className="mt-5 flex justify-end">
              <button type="submit" disabled={!file || loading} className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
                <MdCloudUpload size={21} />{loading ? 'Uploading and saving...' : 'Upload Excel'}
              </button>
            </div>
          </form>
          {result && <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-700">Uploaded file: {result.fileName}</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {summary.map((item) => <div key={item.title} className={`rounded-lg p-4 ${item.style}`}><p className="text-sm">{item.title}</p><p className="mt-1 text-2xl font-bold">{item.value}</p></div>)}
            </div>
          </div>}
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
            <div><h2 className="text-lg font-bold text-slate-800">To Cut Records</h2><p className="text-sm text-slate-500">SKU-wise records loaded from the To Cut report database.</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-orange-50 px-2 py-2 text-sm font-semibold text-orange-700">{filteredRows.length} records</span>
              <button type="button" onClick={fetchReport} disabled={reportLoading} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><MdRefresh size={19} className={reportLoading ? 'animate-spin' : ''} />{reportLoading ? 'Loading...' : 'Refresh'}</button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 border-b bg-slate-50 p-5 sm:grid-cols-2">
            <div className="relative"><MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SKU, Article, Colour, Size..." className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400" /></div>
            <button type="button" onClick={resetFilters} className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"><MdRefresh size={19} />Reset Filters</button>
          </div>
          <div className="w-full overflow-auto overscroll-x-contain">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead><tr>
                <th className="sticky top-0 left-0 z-30 w-[55px] min-w-[55px] border-b border-slate-600 bg-slate-800 px-3 py-3 text-white">#</th>
                {columns.map(([key, label]) => <th key={key} className="sticky top-0 whitespace-nowrap border-b border-slate-600 bg-slate-800 px-3 py-3 text-white"><button type="button" onClick={() => toggleSort(key)} className="flex items-center gap-1 font-semibold hover:text-orange-300">{label}{sortField === key && (sortDirection === 'asc' ? <MdKeyboardArrowUp size={18} /> : <MdKeyboardArrowDown size={18} />)}</button></th>)}
              </tr></thead>
              <tbody>
                {pageRows.length ? pageRows.map((row, index) => {
                  const stripe = index % 2 ? 'bg-slate-50' : 'bg-white';
                  return <tr key={row.tocutreportid ?? row.sku} className="group hover:bg-orange-50">
                    <td className={`sticky left-0 z-10 w-[55px] min-w-[55px] border-b border-slate-200 px-3 py-3 text-slate-500 ${stripe} group-hover:bg-orange-50`}>{(safePage - 1) * pageSize + index + 1}</td>
                    {columns.map(([key]) => <td key={key} className={`whitespace-nowrap border-b border-slate-200 px-3 py-3 ${key === 'sku' ? 'font-semibold text-orange-700' : 'text-slate-700'}`}>{row[key] === null || row[key] === undefined || row[key] === '' ? '-' : row[key]}</td>)}
                  </tr>;
                }) : <tr><td colSpan={columns.length + 1} className="px-3 py-12 text-center text-slate-500">{reportLoading ? 'Loading To Cut records...' : error ? 'Records load nahi ho sake. Upar error check karein.' : 'No records found.'}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600"><span>Rows per page</span><select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-lg border border-slate-300 bg-white px-3 py-2">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}</select><span>{filteredRows.length ? `${(safePage - 1) * pageSize + 1}-${Math.min(safePage * pageSize, filteredRows.length)} of ${filteredRows.length}` : '0 records'}</span></div>
            <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={safePage <= 1} onClick={() => setPage(1)} className="rounded border px-3 py-2 disabled:opacity-40">First</button><button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button><span className="text-sm">Page {safePage} / {totalPages}</span><button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Next</button><button type="button" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)} className="rounded border px-3 py-2 disabled:opacity-40">Last</button></div>
          </div>
        </section>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Import Notes:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Required Excel headings: SKU, tocut, Article, COLOUR, Size.</li>
            <li>Maximum file size 10 MB hai.</li>
            <li>Database mein SKU unique rahega. Same SKU dobara upload hone par existing record update hoga.</li>
            <li>Excel mein same SKU multiple times ho to last row ka data final rahega.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
