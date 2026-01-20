import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Heart } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:3000/api/auth/register', { name, email, password });
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    <div className="flex items-center gap-2">
                        <Heart size={28} fill="currentColor" className="text-primary-300" />
                        <span className="text-2xl font-bold tracking-tight">HopeConnect</span>
                    </div>
                    <div>
                        <blockquote className="text-3xl font-medium leading-tight mb-6">
                            "The smallest act of kindness is worth more than the grandest intention."
                        </blockquote>
                        <p className="text-primary-200 font-medium">– Oscar Wilde</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-1 w-4 bg-primary-700 rounded-full"></div>
                        <div className="h-1 w-12 bg-primary-300 rounded-full"></div>
                        <div className="h-1 w-4 bg-primary-700 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-secondary-50">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-stone-100">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-primary-900">Create an account</h2>
                        <p className="mt-2 text-stone-500">Join our community of changemakers.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                                {error}
                            </div>
                        )}
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-stone-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
