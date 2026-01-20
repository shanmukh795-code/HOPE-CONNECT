import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { DollarSign, ShieldCheck } from 'lucide-react';


const RazorpayForm = ({ amount }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            // 1. Create Order on Backend
            const { data } = await axios.post(
                'http://localhost:3000/api/donations/create-razorpay-order',
                { amount, currency: 'INR' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { orderId, amount: orderAmount, currency, keyId, donationId } = data;

            // 2. Configure Razorpay Options
            const options = {
                key: keyId,
                amount: orderAmount,
                currency: currency,
                name: "HOPE CONNECT",
                description: "Donation Transaction",
                order_id: orderId,
                handler: async function (response) {
                    // 3. Verify Payment on Backend
                    try {
                        await axios.post(
                            'http://localhost:3000/api/donations/verify-razorpay-payment',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                donationId
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setMessage('Donation successful! Thank you.');
                        setTimeout(() => navigate('/dashboard'), 2000);
                    } catch (verifyError) {
                        console.error(verifyError);
                        setMessage('Payment successful, but verification failed.');
                    }
                },
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                    contact: ''
                },
                theme: {
                    color: "#3399cc"
                }
            };

            // 4. Open Razorpay Checkout
            if (window.Razorpay) {
                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', async function (response) {
                    setMessage('Payment Failed: ' + response.error.description);
                    console.error(response.error);

                    // Notify backend about failure
                    try {
                        await axios.post(
                            'http://localhost:3000/api/donations/payment-failed',
                            {
                                donationId,
                                errorDescription: response.error.description
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    } catch (err) {
                        console.error('Failed to report payment failure', err);
                    }
                });
                rzp1.open();
            } else {
                setMessage('Razorpay SDK failed to load. Check internet connection.');
            }

        } catch (error) {
            console.error(error);
            setMessage('Failed to initiate payment. Check server logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 text-center">
                <p className="text-stone-600 mb-4">Click below to proceed with the payment.</p>
                {message && (
                    <div className={`text-sm p-3 rounded-md mb-4 ${message.includes('successful') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {message}
                    </div>
                )}
                <Button onClick={handlePayment} disabled={loading} className="w-full" size="lg">
                    {loading ? 'Processing...' : `Donate with Razorpay (₹${amount})`}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-stone-400 mt-2">
                    <ShieldCheck size={14} />
                    <span>Secure payment via Razorpay</span>
                </div>
            </div>
        </div>
    );
};

const Donate = () => {
    const [amount, setAmount] = useState(500);
    const presetAmounts = [100, 500, 1000, 2000, 5000];

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Make a Difference Today</h1>

                </div>

                <div className="max-w-3xl mx-auto">
                    <Card className="p-6 md:p-8">
                        <h2 className="text-xl font-bold text-primary-800 mb-6">Select Donation Amount (INR)</h2>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {presetAmounts.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setAmount(preset)}
                                    className={`py-3 px-4 rounded-lg font-medium border-2 transition-all
                                        ${amount === preset
                                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                                            : 'border-stone-200 text-stone-600 hover:border-primary-200 hover:bg-stone-50'
                                        }`}
                                >
                                    ₹{preset}
                                </button>
                            ))}
                            <div className="relative col-span-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className={`font-bold ${!presetAmounts.includes(amount) ? 'text-primary-700' : 'text-stone-500'}`}>₹</span>
                                </div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className={`block w-full h-full pl-8 pr-3 py-3 rounded-lg border-2 font-medium focus:outline-none transition-all
                                        ${!presetAmounts.includes(amount)
                                            ? 'border-primary-600 bg-primary-50 text-primary-700 focus:border-primary-600'
                                            : 'border-stone-300 border-dashed text-stone-700 placeholder-stone-400 focus:border-primary-500 hover:border-primary-300'
                                        }`}
                                    placeholder="Custom"
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-primary-800 mb-4">Donor Details</h3>
                            <RazorpayForm amount={amount} />
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Donate;
