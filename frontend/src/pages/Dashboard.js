import React, { useState, useEffect } from 'react';
import { 
  CubeIcon, 
  ShoppingCartIcon, 
  TicketIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClipboardDocumentIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { consumiblesService } from '../services/consumiblesService';
import { dispositivosService } from '../services/dispositivosService';
import { ticketsService } from '../services/ticketsService';
import { movimientosService } from '../services/movimientosService';
import { prestamosService } from '../services/prestamosService';
import ConsumibleCard from '../components/Consumibles/ConsumibleCard';
import DispositivoCard from '../components/Dispositivos/DispositivoCard';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
  const { showNotification } = useNotification();
  const [stats, setStats] = useState({
    totalConsumibles: 0,
    totalDispositivos: 0,
    stockTotal: 0,
    ticketsAbiertos: 0,
    prestamosActivos: 0
  });
  const [loading, setLoading] = useState(true);
  const [consumiblesCriticos, setConsumiblesCriticos] = useState([]);
  const [dispositivosPrestados, setDispositivosPrestados] = useState([]);
  const [movimientosRecientes, setMovimientosRecientes] = useState([]);

  useEffect(() => {
    cargarDashboard();
    const interval = setInterval(cargarDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      
      const [consumibles, dispositivos, tickets, movimientos, prestamos] = await Promise.all([
        consumiblesService.getConsumibles(),
        dispositivosService.getDispositivos(),
        ticketsService.getTickets(),
        movimientosService.getMovimientos(),
        prestamosService.getPrestamosActivos()
      ]);

      const stockTotal = consumibles.reduce((sum, c) => sum + c.stock, 0);
      const criticos = consumibles.filter(c => c.stock <= c.stockMinimo && c.stock > 0);
      const sinStock = consumibles.filter(c => c.stock === 0);
      const prestados = dispositivos.filter(d => d.estadoActual === 'Prestado');

      setStats({
        totalConsumibles: consumibles.length,
        totalDispositivos: dispositivos.length,
        stockTotal: stockTotal,
        ticketsAbiertos: tickets.filter(t => t.estado === 'abierto').length,
        prestamosActivos: prestamos.length
      });

      setConsumiblesCriticos([...criticos, ...sinStock]);
      setDispositivosPrestados(prestados);
      
      // Procesar movimientos recientes para mostrar correctamente Préstamos y Devoluciones
      const recientes = movimientos.slice(0, 6).map(mov => {
        let fechaValida = null;
        let fechaTexto = '';
        
        if (mov.fecha) {
          fechaValida = new Date(mov.fecha);
          if (!isNaN(fechaValida.getTime())) {
            fechaTexto = fechaValida.toLocaleString();
          }
        }
        
        // Determinar el tipo de movimiento para mostrar
        let tipoMostrar = '';
        let IconoMostrar = null;
        let colorMostrar = '';
        
        switch(mov.tipo) {
          case 'Entrada':
            tipoMostrar = 'Entrada';
            IconoMostrar = ArrowUpIcon;
            colorMostrar = 'text-green-600 bg-green-50';
            break;
          case 'Salida':
            tipoMostrar = 'Salida';
            IconoMostrar = ArrowDownIcon;
            colorMostrar = 'text-red-600 bg-red-50';
            break;
          case 'Prestamo':
            tipoMostrar = 'Préstamo';
            IconoMostrar = ClipboardDocumentIcon;
            colorMostrar = 'text-yellow-600 bg-yellow-50';
            break;
          case 'Devolucion':
            tipoMostrar = 'Devolución';
            IconoMostrar = ArrowUturnLeftIcon;
            colorMostrar = 'text-blue-600 bg-blue-50';
            break;
          default:
            tipoMostrar = mov.tipo || 'Movimiento';
            IconoMostrar = ArrowTrendingUpIcon;
            colorMostrar = 'text-gray-600 bg-gray-50';
        }
        
        return {
          id: mov._id,
          material: mov.materialNombre,
          tipo: mov.tipo,
          tipoMostrar: tipoMostrar,
          Icono: IconoMostrar,
          color: colorMostrar,
          cantidad: mov.cantidad,
          motivo: mov.motivo,
          fecha: fechaTexto,
          fechaValida: fechaValida,
          ticketId: mov.ticketId,
          tecnico: mov.tecnico,
          responsable: mov.responsable,
          lugar: mov.lugar,
          marca: mov.marca
        };
      });
      
      setMovimientosRecientes(recientes);
      
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      if (showNotification) {
        showNotification('Error al cargar los datos del dashboard', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Consumibles', 
      value: stats.totalConsumibles, 
      icon: CubeIcon,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      description: 'Total en inventario'
    },
    { 
      title: 'Dispositivos', 
      value: stats.totalDispositivos, 
      icon: ComputerDesktopIcon,
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      description: 'Equipos registrados'
    },
    { 
      title: 'Stock Total', 
      value: stats.stockTotal, 
      icon: ShoppingCartIcon,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      bg: 'bg-green-50',
      description: 'Unidades disponibles'
    },
    { 
      title: 'Préstamos Activos', 
      value: stats.prestamosActivos, 
      icon: ClipboardDocumentIcon,
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-50',
      description: 'En préstamo'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Panel de control del sistema</p>
        </div>
        <button 
          onClick={cargarDashboard}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span className="hidden xs:inline">Actualizar</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className={`relative overflow-hidden ${stat.bg} rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group`}
          >
            <div className="p-3 sm:p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 hidden xs:block">
                    {stat.description}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-2 sm:p-2.5 md:p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              
              {/* Barra de progreso decorativa */}
              <div className="mt-3 sm:mt-4">
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      index === 0 ? 'w-3/4 bg-blue-500' :
                      index === 1 ? 'w-1/2 bg-purple-500' :
                      index === 2 ? 'w-2/3 bg-green-500' : 'w-1/3 bg-yellow-500'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Decoración de fondo */}
            <div className="absolute -bottom-2 -right-2 opacity-5 hidden sm:block">
              <stat.icon className="w-16 h-16 md:w-20 md:h-20 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Stock Crítico Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Stock Crítico</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 self-start xs:self-auto">
                {consumiblesCriticos.length} consumibles
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4 max-h-80 sm:max-h-96 overflow-y-auto">
            {consumiblesCriticos.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                  <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Todo en orden</p>
                <p className="text-xs text-gray-400 mt-1">No hay consumibles con stock crítico</p>
              </div>
            ) : (
              <div className="space-y-3">
                {consumiblesCriticos.map(consumible => (
                  <ConsumibleCard key={consumible._id} consumible={consumible} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Movimientos Recientes Section - MEJORADO */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <ArrowTrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Movimientos Recientes</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start xs:self-auto">
                Últimos 6 registros
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4 max-h-80 sm:max-h-96 overflow-y-auto">
            {movimientosRecientes.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                  <ShoppingCartIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">Sin movimientos</p>
                <p className="text-xs text-gray-400 mt-1">Registra entradas, salidas o préstamos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {movimientosRecientes.map((mov) => (
                  <div key={mov.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {mov.material}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${mov.color}`}>
                          {mov.Icono && <mov.Icono className="w-3 h-3" />}
                          {mov.tipoMostrar}
                        </span>
                        {mov.marca && (
                          <span className="text-xs text-gray-400">({mov.marca})</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {mov.fecha && mov.fecha !== 'Fecha no disponible' ? mov.fecha : 'Fecha no disponible'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate" title={mov.motivo}>
                        {mov.motivo}
                      </p>
                      {mov.responsable && (
                        <p className="text-xs text-gray-400 mt-0.5">Responsable: {mov.responsable}</p>
                      )}
                      {mov.lugar && (
                        <p className="text-xs text-gray-400">Lugar: {mov.lugar}</p>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <p className={`text-sm font-bold ${
                        mov.tipo === 'Entrada' ? 'text-green-600' : 
                        mov.tipo === 'Salida' ? 'text-red-600' : 
                        mov.tipo === 'Prestamo' ? 'text-yellow-600' :
                        mov.tipo === 'Devolucion' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {mov.tipo === 'Entrada' ? '+' : ''}{mov.cantidad}
                      </p>
                      {mov.ticketId && (
                        <p className="text-xs text-blue-500 mt-1">Ticket: {mov.ticketId}</p>
                      )}
                      {mov.tecnico && (
                        <p className="text-xs text-gray-400">{mov.tecnico}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispositivos en Préstamo */}
      {dispositivosPrestados.length > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-100 rounded-lg">
                  <ComputerDesktopIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Dispositivos en Préstamo</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 self-start xs:self-auto">
                {dispositivosPrestados.length} dispositivos
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dispositivosPrestados.map(dispositivo => (
                <DispositivoCard key={dispositivo._id} dispositivo={dispositivo} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;