import { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import { Save, Camera } from 'lucide-react';

const TicketDuoForm = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    gross_amount_one: '',
    gross_amount_two: '',
    prizes_amount_one: '',
    prizes_amount_two: '',
    telequino_amount_one: '',
    telequino_amount_two: '',
    net_amount_one: '0',
    net_amount_two: '0',
  });
  const [calculatedValues, setCalculatedValues] = useState({
    caja: '0',
    telebingoTotal: '0',
    netoFinal: '0',
  });
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    const errors: string[] = [];
    const fields = [
      { key: 'gross_amount_one', label: 'El primer bruto' },
      { key: 'gross_amount_two', label: 'El segundo bruto' },
      { key: 'prizes_amount_one', label: 'El primer premio' },
      { key: 'prizes_amount_two', label: 'El segundo premio' },
      { key: 'telequino_amount_one', label: 'El primer Telequino' },
      { key: 'telequino_amount_two', label: 'El segundo Telequino' },
    ];

    fields.forEach(({ key, label }) => {
      const value = formData[key as keyof typeof formData].trim();
      if (!value) {
        errors.push(`${label} es obligatorio`);
      } else if (Number.isNaN(Number(value))) {
        errors.push(`${label} debe ser un número válido`);
      }
    });

    if (errors.length > 0) {
      setApiError(errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('date', formData.date);
      payload.append('gross_amount_one', formData.gross_amount_one);
      payload.append('gross_amount_two', formData.gross_amount_two);
      payload.append('prizes_amount_one', formData.prizes_amount_one);
      payload.append('prizes_amount_two', formData.prizes_amount_two);
      payload.append('telequino_amount_one', formData.telequino_amount_one);
      payload.append('telequino_amount_two', formData.telequino_amount_two);
      payload.append('net_amount_one', formData.net_amount_one);
      payload.append('net_amount_two', formData.net_amount_two);

      if (image) {
        payload.append('image', image);
      }

      await axios.post('/api/tickets/duo', payload);

      alert('Registros guardados correctamente');
      setApiError(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        gross_amount_one: '',
        gross_amount_two: '',
        prizes_amount_one: '',
        prizes_amount_two: '',
        telequino_amount_one: '',
        telequino_amount_two: '',
        net_amount_one: '0',
        net_amount_two: '0',
      });
      setCalculatedValues({
        caja: '0',
        telebingoTotal: '0',
        netoFinal: '0',
      });
      setImage(null);
    } catch (error: unknown) {
      console.error(error);

      let backendMessage = 'Ocurrió un error al guardar los registros';
      if (error instanceof Error) {
        backendMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string | string[] } } };
        backendMessage = axiosError.response?.data?.message ?? backendMessage;
      }

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
    const brutoOne = parseFloat(formData.gross_amount_one) || 0;
    const premiosOne = parseFloat(formData.prizes_amount_one) || 0;
    const netOne = brutoOne - premiosOne;
    setFormData(prev => ({ ...prev, net_amount_one: netOne.toFixed(2) }));

    const brutoTwo = parseFloat(formData.gross_amount_two) || 0;
    const premiosTwo = parseFloat(formData.prizes_amount_two) || 0;
    const netTwo = brutoTwo - premiosTwo;
    setFormData(prev => ({ ...prev, net_amount_two: netTwo.toFixed(2) }));

    const brutoTotal = brutoOne + brutoTwo;
    const premiosTotal = premiosOne + premiosTwo;
    const caja = brutoTotal - premiosTotal;

    const telebingoOne = parseFloat(formData.telequino_amount_one) || 0;
    const telebingoTwo = parseFloat(formData.telequino_amount_two) || 0;
    const telebingoTotal = telebingoOne + telebingoTwo;

    const netoFinal = caja - telebingoTotal / 2;

    setCalculatedValues({
      caja: caja.toFixed(2),
      telebingoTotal: telebingoTotal.toFixed(2),
      netoFinal: netoFinal.toFixed(2),
    });
  }, [formData.gross_amount_one, formData.prizes_amount_one, formData.gross_amount_two, formData.prizes_amount_two, formData.telequino_amount_one, formData.telequino_amount_two]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <Save className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Nueva Carga Diaria para Ambas Máquinas</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
        <input
          type="date"
          value={formData.date}
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          onChange={e => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Máquina 1 */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Máquina 1</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bruto</label>
              <input
                type="number"
                placeholder="Ingrese el total bruto"
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
                value={formData.gross_amount_one}
                onChange={e => setFormData({ ...formData, gross_amount_one: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Premios</label>
              <input
                type="number"
                placeholder="Ingrese el total de premios pagados"
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
                value={formData.prizes_amount_one}
                onChange={e => setFormData({ ...formData, prizes_amount_one: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Telebingo</label>
              <input
                type="number"
                placeholder="Ingrese el total de apuestas en Telebingo"
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
                value={formData.telequino_amount_one}
                onChange={e => setFormData({ ...formData, telequino_amount_one: e.target.value })}
                required
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-100">
              <label className="block text-sm font-black text-blue-800 uppercase tracking-wider mb-2">Importe Neto Calculado</label>
              <input
                type="number"
                value={formData.net_amount_one}
                className="w-full p-4 bg-white border-2 border-blue-200 rounded-xl text-xl font-black text-blue-600 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                onChange={e => setFormData({ ...formData, net_amount_one: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Máquina 2 */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Máquina 2</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bruto</label>
              <input
                type="number"
                placeholder="Ingrese el total bruto"
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
                value={formData.gross_amount_two}
                onChange={e => setFormData({ ...formData, gross_amount_two: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Premios</label>
              <input
                type="number"
                placeholder="Ingrese el total de premios pagados"
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
                value={formData.prizes_amount_two}
                onChange={e => setFormData({ ...formData, prizes_amount_two: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Telebingo</label>
              <input
                type="number"
                placeholder="Ingrese el total de apuestas en Telebingo"
                className="w-full p-3 border rounded-xl focus:border-blue-500 outline-none"
                value={formData.telequino_amount_two}
                onChange={e => setFormData({ ...formData, telequino_amount_two: e.target.value })}
                required
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-100">
              <label className="block text-sm font-black text-blue-800 uppercase tracking-wider mb-2">Importe Neto Calculado</label>
              <input
                type="number"
                value={formData.net_amount_two}
                className="w-full p-4 bg-white border-2 border-blue-200 rounded-xl text-xl font-black text-blue-600 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                onChange={e => setFormData({ ...formData, net_amount_two: e.target.value })}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-100 mb-6">
        <h3 className="text-lg font-bold text-green-800 mb-4">Resúmenes Calculados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-black text-green-800 uppercase tracking-wider mb-2">Caja (Bruto Total - Premios Total)</label>
            <input
              type="text"
              value={calculatedValues.caja}
              readOnly
              className="w-full p-4 bg-white border-2 border-green-200 rounded-xl text-xl font-black text-green-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-green-800 uppercase tracking-wider mb-2">Telebingo Total</label>
            <input
              type="text"
              value={calculatedValues.telebingoTotal}
              readOnly
              className="w-full p-4 bg-white border-2 border-green-200 rounded-xl text-xl font-black text-green-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-green-800 uppercase tracking-wider mb-2">Neto Final (Caja - Telebingo / 2)</label>
            <input
              type="text"
              value={calculatedValues.netoFinal}
              readOnly
              className="w-full p-4 bg-white border-2 border-green-200 rounded-xl text-xl font-black text-green-600 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 cursor-pointer">
          <Camera size={20} /> Foto del Ticket
        </label>
        <input
          type="file"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] || null)}
        />
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
        {isSubmitting ? 'Guardando...' : 'GUARDAR REGISTROS'}
      </button>
    </div>
  );
};

export default TicketDuoForm;