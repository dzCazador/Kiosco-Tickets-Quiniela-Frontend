import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import { Save, Camera } from 'lucide-react';

const TicketForm = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    gross_amount: '',
    prizes_amount: '',
    telequino_amount: '',
    net_amount: '0',
    machineId: '1',
  });
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    const errors: string[] = [];
    const bruto = formData.gross_amount.trim();
    const premios = formData.prizes_amount.trim();
    const telequino = formData.telequino_amount.trim();

    if (!bruto) {
      errors.push('El importe de bruto es obligatorio');
    } else if (Number.isNaN(Number(bruto))) {
      errors.push('El importe de bruto debe ser un número válido');
    }

    if (!premios) {
      errors.push('El importe de premios es obligatorio');
    } else if (Number.isNaN(Number(premios))) {
      errors.push('El importe de premios debe ser un número válido');
    }

    if (!telequino) {
      errors.push('El importe de telebingo es obligatorio');
    } else if (Number.isNaN(Number(telequino))) {
      errors.push('El importe de telebingo debe ser un número válido');
    }

    if (errors.length > 0) {
      setApiError(errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('date', formData.date);
      payload.append('gross_amount', formData.gross_amount);
      payload.append('prizes_amount', formData.prizes_amount);
      payload.append('telequino_amount', formData.telequino_amount);
      payload.append('net_amount', formData.net_amount);
      payload.append('machineId', formData.machineId);

      if (image) {
        payload.append('image', image);
      }

      await axios.post('/api/tickets', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Registro guardado correctamente');
      setApiError(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        gross_amount: '',
        prizes_amount: '',
        telequino_amount: '',
        net_amount: '0',
        machineId: '1',
      });
      setImage(null);
    } catch (error: any) {
      console.error(error);

      const backendMessage =
        error?.response?.data?.message ??
        error?.message ??
        'Ocurrió un error al guardar el registro';

      const formattedMessage = Array.isArray(backendMessage)
        ? backendMessage.join('\n')
        : String(backendMessage);

      const formattedDateMessage = formattedMessage.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, '$3/$2/$1');

      setApiError(formattedDateMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const bruto = parseFloat(formData.gross_amount) || 0;
    const premios = parseFloat(formData.prizes_amount) || 0;
    const sugerido = bruto - premios ;
    setFormData(prev => ({ ...prev, net_amount: sugerido.toFixed(2) }));
  }, [formData.gross_amount, formData.prizes_amount, formData.telequino_amount]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <Save className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Nueva Carga Diaria</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
          <input type="date" value={formData.date} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, date: e.target.value})} 
          required/>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Máquina</label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="machineId"
                value="1"
                checked={formData.machineId === '1'}
                onChange={e => setFormData({...formData, machineId: e.target.value})}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Caja 1</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="machineId"
                value="2"
                checked={formData.machineId === '2'}
                onChange={e => setFormData({...formData, machineId: e.target.value})}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Caja 2</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Bruto</label>
          <input
            type="number"
            placeholder="Ingrese el total bruto"
            className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
            onChange={e => setFormData({...formData, gross_amount: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Premios</label>
          <input
            type="number"
            placeholder="Ingrese el total de premios pagados"
            className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
            onChange={e => setFormData({...formData, prizes_amount: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Telebingo</label>
          <input
            type="number"
            placeholder="Ingrese el total de apuestas en Telebingo"
            className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
            onChange={e => setFormData({...formData, telequino_amount: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 mb-6">
        <label className="block text-sm font-black text-blue-800 uppercase tracking-wider mb-2">Importe Neto Calculado (Modificable)</label>
        <input type="number" value={formData.net_amount} className="w-full p-4 bg-white border-2 border-blue-200 rounded-xl text-2xl font-black text-blue-600 focus:ring-4 focus:ring-blue-200 outline-none transition-all" onChange={e => setFormData({...formData, net_amount: e.target.value})} required />
      </div>

      <div className="mb-8 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 cursor-pointer">
          <Camera size={20} /> Foto del Ticket
        </label>
        <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 whitespace-pre-line">
          {apiError}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-lg shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : 'GUARDAR REGISTRO'}
      </button>
    </div>
  );
};

export default TicketForm;