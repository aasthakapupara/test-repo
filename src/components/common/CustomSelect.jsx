import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import './CustomSelect.css';

const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    label,
    isMulti = false,
    name
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue) => {
        if (isMulti) {
            const newValue = value.includes(optionValue)
                ? value.filter(v => v !== optionValue)
                : [...value, optionValue];
            onChange({ target: { name, value: newValue } });
        } else {
            onChange({ target: { name, value: optionValue } });
            setIsOpen(false);
        }
    };

    const getDisplayValue = () => {
        if (isMulti) {
            if (!value || value.length === 0) return placeholder;
            return `${value.length} selected`;
        }
        const selected = options.find(opt => opt.value === value);
        return selected ? selected.label : placeholder;
    };

    return (
        <div className="custom-select-container" ref={containerRef}>
            {label && <label className="custom-select-label">{label}</label>}
            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={(!value || (isMulti && value.length === 0)) ? 'placeholder' : ''}>
                    {getDisplayValue()}
                </span>
                <ChevronDown size={18} className={`chevron ${isOpen ? 'rotate' : ''}`} />
            </div>

            {isOpen && (
                <div className="custom-select-dropdown animate-fade">
                    <div className="search-wrapper">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <div className="options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    className={`option-item ${isMulti ? (value.includes(opt.value) ? 'selected' : '') : (value === opt.value ? 'selected' : '')}`}
                                    onClick={() => handleSelect(opt.value)}
                                >
                                    {isMulti && (
                                        <div className="checkbox">
                                            {value.includes(opt.value) && <div className="checked" />}
                                        </div>
                                    )}
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="no-options">No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
