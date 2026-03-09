import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Radio } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                navigate('/admin');
            }
        } catch (err) {
            console.error(err);
            setError('Credenciales incorrectas o usuario no encontrado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-accent-red rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(183,28,28,0.5)]">
                        <Radio className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-title font-bold text-center">Admin CTN Radio</h2>
                    <p className="text-gray-400 text-sm mt-2 text-center">Ingresa con tu cuenta de Firebase</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg p-3 mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors"
                            placeholder="admin@ctnradio.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-red focus:ring-1 focus:ring-accent-red transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition duration-300 shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-gray-500 hover:text-white transition-colors">Volver al sitio público</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
