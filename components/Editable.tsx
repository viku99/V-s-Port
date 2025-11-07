import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { useEditor } from './EditorProvider';
import get from 'lodash.get';
import Icon from './Icon';

type EditableProps = {
    path: string;
    as?: React.ElementType;
    className?: string;
    multiline?: boolean;
    label?: string;
    type?: 'text' | 'media';
    children?: ReactNode; // Allow wrapping components for media editing
    render?: (value: any) => React.ReactNode;
};

const Editable: React.FC<EditableProps> = ({
    path,
    as: Component = 'span',
    className,
    multiline = false,
    label,
    type = 'text',
    children,
    render,
}) => {
    const { isEditMode, siteContent, updateSiteContent, openMediaModal } = useEditor();
    const [isEditing, setIsEditing] = useState(false);
    const text = get(siteContent, path, '');
    const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && type === 'text' && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing, type]);

    const handleUpdate = useCallback((newValue: string) => {
        if (!siteContent) return;

        const valueToSet = Array.isArray(get(siteContent, path)) ? newValue.split(',').map(s => s.trim()) : newValue;

        updateSiteContent(draft => {
            const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
            let current: any = draft;
            while (keys.length > 1) {
                const key = keys.shift()!;
                current = current[key];
            }
            if (keys[0]) {
               current[keys[0]] = valueToSet;
            }
        });
    }, [path, siteContent, updateSiteContent]);

    const handleBlur = () => {
        if (inputRef.current) {
            handleUpdate(inputRef.current.value);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            setIsEditing(false);
        }
    };

    if (!isEditMode) {
        if (render) return <>{render(text)}</>;
        if (children) return <>{children}</>;
        return <Component className={className} dangerouslySetInnerHTML={{ __html: Array.isArray(text) ? text.join(', ') : text }} />;
    }

    if (type === 'media') {
        return (
            <div className="relative group">
                {children}
                <button
                    onClick={() => openMediaModal(path)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                    <div className="flex items-center px-4 py-2 text-sm font-bold text-black bg-white rounded-md">
                        <Icon name="edit-media" className="mr-2" /> Edit Media
                    </div>
                </button>
            </div>
        );
    }
    
    if (isEditing) {
        const InputComponent = multiline ? 'textarea' : 'input';
        const value = Array.isArray(text) ? text.join(', ') : text;

        return (
            <div className="relative w-full">
                {label && <label className="text-xs text-blue-400 absolute -top-4 left-0">{label}</label>}
                <InputComponent
                    ref={inputRef}
                    defaultValue={value}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`bg-blue-900/50 text-white p-1 border border-blue-500 rounded-md outline-none w-full resize-none ${className}`}
                    rows={multiline ? 4 : undefined}
                />
            </div>
        );
    }
    
    const displayContent = () => {
        if (render) return render(text);
        if (Array.isArray(text)) return text.map((item, index) => <React.Fragment key={index}>{item}{index < text.length -1 && ", "}</React.Fragment>);
        return <div dangerouslySetInnerHTML={{ __html: text }}/>
    }

    return (
        <Component
            onClick={() => setIsEditing(true)}
            className={`outline-none transition-all duration-300 cursor-pointer hover:outline-2 hover:outline-dashed hover:outline-blue-500 p-1 -m-1 rounded-md ${className}`}
        >
            {displayContent()}
        </Component>
    );
};

export default Editable;