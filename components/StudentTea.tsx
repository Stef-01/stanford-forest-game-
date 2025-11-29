/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef } from 'react';
import { TeaMessage } from '../types';

interface StudentTeaProps {
    messages: TeaMessage[];
}

const StudentTea: React.FC<StudentTeaProps> = ({ messages }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isCollapsed]);

    if (messages.length === 0) return null;

    return (
        <div className="w-full md:w-80 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden transition-all duration-300">
            <div
                className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/50 border-b border-white/10 flex justify-between items-center cursor-pointer hover:bg-white/5"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <span>Student Tea 🧋</span>
                <span>{isCollapsed ? '▼' : '▲'}</span>
            </div>

            {!isCollapsed && (
                <div ref={scrollRef} className="overflow-y-auto h-32 p-3 space-y-2 scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className="text-xs text-white/90 leading-snug animate-fade-in">
                            <span className={`font-bold ${msg.type === 'gossip' ? 'text-pink-400' :
                                msg.type === 'event' ? 'text-blue-400' :
                                    'text-yellow-400'
                                }`}>
                                {msg.sender}:
                            </span>{' '}
                            <span className="drop-shadow-sm">{msg.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentTea;
