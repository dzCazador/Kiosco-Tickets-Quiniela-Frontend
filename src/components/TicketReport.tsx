import { useState } from 'react';
import axios from 'axios';
import { Search, ExternalLink, Loader2 } from 'lucide-react';

type TicketReportProps = {
  role: 'kiosco' | 'agencia';
};

const TicketReport = ({ role }: TicketReportProps) => {
  const [range, setRange] = useState({ from: '', to: '' });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/tickets?from=${range.from}&to=${range.to}`);
      setData(res.data);
    } catch (error) {
      alert('Error al cargar reporte');
    } finally {
      setLoading(false);
    }
  };

  const isDeletable = (dateString: string) => {
    const ticketDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffMs = todayUTC.getTime() - ticketDate.getTime();
    return diffMs >= 0 && diffMs <= 2 * 24 * 60 * 60 * 1000;
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Querés eliminar este registro?')) return;

    try {
      setDeletingId(id);
      await axios.delete(`/api/tickets/${id}`);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      alert('No se pudo eliminar el registro');
    } finally {
      setDeletingId(null);
    }
  };

  const totals = data.reduce(
    (acc, ticket) => {
      acc.net += Number(ticket.net_amount) || 0;
      acc.gross += Number(ticket.gross_amount) || 0;
      acc.prizes += Number(ticket.prizes_amount) || 0;
      acc.telequino += Number(ticket.telequino_amount) || 0;
      return acc;
    },
    { net: 0, gross: 0, prizes: 0, telequino: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-wrap items-end gap-4 justify-center border border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Desde</label>
          <input type="date" className="mt-1 p-2 border rounded-lg" onChange={e => setRange({...range, from: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase">Hasta</label>
          <input type="date" className="mt-1 p-2 border rounded-lg" onChange={e => setRange({...range, to: e.target.value})} />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <Search size={18} /> Consultar
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Máquina</th>
              <th className="p-4 text-right">Importes</th>
              <th className="p-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-medium">No hay registros para mostrar</td></tr>
            ) : (
              data.map((t: any) => {
                const canDelete = role === 'kiosco' && isDeletable(t.date);

                return (
                  <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-medium">{new Date(t.date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                    <td className="p-4 text-gray-600">{t.machine?.name || 'N/A'}</td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-blue-600">
                        ${t.net_amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Bruto: ${Number(t.gross_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        Premios: ${Number(t.prizes_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        Telequino: ${Number(t.telequino_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="p-4 text-center space-y-1">
                      {t.image_url ? (
                        <a href={`${t.image_url}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center justify-center gap-1">
                          <ExternalLink size={14} /> Ver Foto
                        </a>
                      ) : (
                        <span className="text-gray-300">Sin foto</span>
                      )}

                      {canDelete ? (
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="mt-2 inline-flex items-center justify-center rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === t.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      ) : (
                        role === 'kiosco' && (
                          <span className="mt-2 block text-xs text-gray-400">Solo últimos 2 días</span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot className="bg-gray-50 text-gray-600 border-t">
              <tr>
                <td className="p-4 font-semibold">Totales</td>
                <td />
                <td className="p-4 text-right">
                  <div className="font-bold text-blue-600">
                    ${totals.net.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Bruto: ${totals.gross.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">
                    Premios: ${totals.prizes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">
                    Telequino: ${totals.telequino.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default TicketReport;