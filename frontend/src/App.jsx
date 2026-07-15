import { useState, useEffect } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [currentFilename, setCurrentFilename] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Помилка завантаження історії:', err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Будь ласка, оберіть PDF файл.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setSummary('');
    setCurrentFilename(file.name);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Не вдалося обробити документ');
      }

      const data = await response.json();
      setSummary(data.summary);
      fetchHistory();
    } catch (err) {
      setError(err.message || 'Щось пішло не так.');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setSummary(item.summary);
    setCurrentFilename(item.filename);
    setError('');
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Заголовок */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">PDF Summary AI</h1>
          <p className="text-slate-500">FastAPI & React Full-Stack Assignment</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Робоча зона (Ліва частина) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-4 text-slate-700">Завантажити документ</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-indigo-600 font-medium">
                      {file ? file.name : 'Натисніть або перетягніть PDF файл сюди'}
                    </p>
                    <p className="text-xs text-slate-400">PDF до 50MB</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Обробка...' : 'Згенерувати Summary'}
                </button>
              </form>
            </div>

            {/* Блок з результатом */}
            {(loading || summary || error) && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold mb-3 text-slate-700">
                  {loading ? 'Аналізуємо...' : `Результат: ${currentFilename}`}
                </h2>

                {loading && (
                  <div className="py-8 text-center">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
                    <p className="text-slate-400 text-sm">Витягуємо текст та генеруємо саммарі...</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {summary && !loading && (
                  <div className="text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {summary}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Історія (Права колонка) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-xl font-bold mb-4 text-slate-700">Історія</h2>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-slate-400 text-sm italic">Ще немає оброблених файлів</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleHistoryClick(item)}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 rounded-xl cursor-pointer border border-slate-100 transition-all"
                  >
                    <p className="font-semibold text-slate-700 truncate text-sm">{item.filename}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;