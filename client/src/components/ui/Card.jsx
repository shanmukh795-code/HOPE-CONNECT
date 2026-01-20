import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className }) => {
    return (
        <div className={cn("bg-white rounded-xl shadow-md border border-stone-100 overflow-hidden", className)}>
            {children}
        </div>
    );
};

export default Card;
