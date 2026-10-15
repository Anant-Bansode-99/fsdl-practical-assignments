import { useState, useEffect, useContext } from 'react';
import { Tag, ShoppingBag } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BuyModal from '../components/BuyModal';

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles/public');
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleBuyClick = (vehicle) => {
    if (!user) { navigate('/login'); return; }
    setSelectedVehicle(vehicle);
  };

  const handleBuySuccess = () => {
    setSelectedVehicle(null);
    setSuccessMsg('Purchase request sent! The vehicle is now reserved. Check "My Purchases" in your dashboard.');
    fetchVehicles();
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  if (loading) return <div className="text-center py-20 text-xl font-medium text-slate-500">Loading marketplace...</div>;

  return (
    <div className="py-8 relative">
      {/* Success notification */}
      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm max-w-xl">
          <span>✅</span> {successMsg}
        </div>
      )}

      {/* Buy Modal */}
      {selectedVehicle && (
        <BuyModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onSuccess={handleBuySuccess}
        />
      )}

      <div className="text-center mb-16 relative">
        <div className="absolute inset-x-0 -top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#f97316] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 font-outfit">
          Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Next Ride</span>
        </h1>
        <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto font-medium">
          Browse our curated selection of premium pre-owned cars and bikes. Best prices guaranteed.
        </p>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl max-w-2xl mx-auto">
          <p className="text-2xl font-bold text-slate-800 font-outfit">No vehicles available right now.</p>
          <p className="mt-3 text-slate-500 text-lg">Check back later or sign up to sell yours!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
          {vehicles.map(vehicle => (
            <div key={vehicle._id} className="glass-card rounded-3xl overflow-hidden group flex flex-col h-full relative">
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {vehicle.image ? (
                  <img src={`http://localhost:5000${vehicle.image}`} alt={vehicle.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-slate-100 text-slate-400 font-medium">No Image Provided</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg border border-white/50 text-slate-800">
                  <Tag className="w-4 h-4 text-orange-500" />
                  ₹{vehicle.price.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col flex-grow relative bg-white/60">
                <div className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">{vehicle.type}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-outfit leading-tight">{vehicle.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">{vehicle.description}</p>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-6 mt-auto">
                  <div className="text-sm font-medium text-slate-500">
                    Seller: <span className="text-slate-800 font-semibold">{vehicle.seller?.name || 'Unknown'}</span>
                  </div>
                  <button
                    onClick={() => handleBuyClick(vehicle)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <ShoppingBag className="w-4 h-4" /> Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
