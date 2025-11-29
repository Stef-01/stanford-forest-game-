/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ChatboardMessage } from '../types';

interface ChatboardProps {
    messages: ChatboardMessage[];
}

const Chatboard: React.FC<ChatboardProps> = ({ messages }) => {
    if (messages.length === 0) return null;

    return (
        <div className="absolute top-20 right-4 w-64 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-teal-100 pointer-events-auto">
            <h3 className="text-teal-800 font-bold text-sm mb-3 flex items-center gap-2">
                <span>📋</span> CAMPUS CHATBOARD
            </h3>

            <div className="space-y-3">
                {messages.map((msg) => (
                    <div key={msg.id} className="bg-teal-50 p-3 rounded border border-teal-100 relative">
                        <div className="text-xs font-bold text-teal-700 mb-1">{msg.ceoName}</div>
                        <p className="text-sm text-gray-700 italic">"{msg.message}"</p>
                        <div className="mt-2 flex justify-between items-center">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold ${msg.category === 'inspiration' ? 'bg-yellow-100 text-yellow-700' :
                                    msg.category === 'advice' ? 'bg-blue-100 text-blue-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {msg.category}
                            </span>
                            <span className="text-[10px] text-gray-400">Day {msg.timestamp}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chatboard;
