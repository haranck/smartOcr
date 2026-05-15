import React, { useState, useRef } from 'react';
import './MainPage.css';
import { useAadhaarOCR } from '../hooks/useAdharOCR';

export const MainPage: React.FC = () => {
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);
    
    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);

    const { loading, result, processImages } = useAadhaarOCR();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (side === 'front') {
                setFrontFile(file);
                setFrontPreview(previewUrl);
            } else {
                setBackFile(file);
                setBackPreview(previewUrl);
            }
        }
    };

    const handleProcess = () => {
        processImages(frontFile, backFile);
    };

    return (
        <div className="main-container">
            {/* Left Sidebar */}
            <aside className="sidebar">
                <div className="brand">
                    <h1>Smart<span>OCR</span></h1>
                    <p>Next-gen document intelligence.</p>
                </div>

                <div className="upload-section">
                    <div className="label-title">
                        <small style={{ fontWeight: 800, color: '#64748b', fontSize: '11px' }}>AADHAAR FRONT</small>
                    </div>
                    <div 
                        className={`upload-card ${frontFile ? 'has-image' : ''}`} 
                        onClick={() => frontInputRef.current?.click()}
                    >
                        {frontPreview ? (
                            <div className="preview-container">
                                <img src={frontPreview} alt="Front Preview" className="img-preview" />
                                {loading && (
                                    <div className="scanning-overlay">
                                        <div className="scan-line"></div>
                                    </div>
                                )}
                                <div className="replace-overlay">
                                    <span>Replace Image</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="icon-box">🪪</div>
                                <span>Upload Front Side</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            hidden 
                            ref={frontInputRef} 
                            onChange={(e) => handleFileChange(e, 'front')}
                            accept="image/*"
                        />
                    </div>

                    <div className="label-title">
                        <small style={{ fontWeight: 800, color: '#64748b', fontSize: '11px' }}>AADHAAR BACK</small>
                    </div>
                    <div 
                        className={`upload-card ${backFile ? 'has-image' : ''}`} 
                        onClick={() => backInputRef.current?.click()}
                    >
                        {backPreview ? (
                            <div className="preview-container">
                                <img src={backPreview} alt="Back Preview" className="img-preview" />
                                {loading && (
                                    <div className="scanning-overlay">
                                        <div className="scan-line"></div>
                                    </div>
                                )}
                                <div className="replace-overlay">
                                    <span>Replace Image</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="icon-box">📄</div>
                                <span>Upload Back Side</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            hidden 
                            ref={backInputRef} 
                            onChange={(e) => handleFileChange(e, 'back')}
                            accept="image/*"
                        />
                    </div>
                </div>

                <button 
                    className="process-btn" 
                    onClick={handleProcess}
                    disabled={loading || !frontFile || !backFile}
                >
                    {loading ? <div className="loading-spinner" style={{ margin: '0 auto' }}></div> : 'Process Aadhaar'}
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="content">
                <section>
                    <div className="section-title">
                        <div className="indicator"></div>
                        <h2>Extracted Information</h2>
                    </div>

                    <div className="info-card">
                        <div className="input-group">
                            <label>Aadhaar Number</label>
                            <input 
                                type="text" 
                                readOnly 
                                value={result?.aadhaarNumber || ''} 
                                placeholder="XXXX XXXX XXXX" 
                            />
                        </div>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                readOnly 
                                value={result?.name || ''} 
                                placeholder="Name as per Aadhaar" 
                            />
                        </div>
                        <div className="input-group">
                            <label>Date of Birth</label>
                            <input 
                                type="text" 
                                readOnly 
                                value={result?.dob || ''} 
                                placeholder="DD/MM/YYYY" 
                            />
                        </div>
                        <div className="input-group">
                            <label>Gender</label>
                            <input 
                                type="text" 
                                readOnly 
                                value={result?.gender || ''} 
                                placeholder="Gender" 
                            />
                        </div>
                        <div className="input-group">
                            <label>Pincode</label>
                            <input 
                                type="text" 
                                readOnly 
                                value={result?.pincode || ''} 
                                placeholder="6-digit ZIP" 
                            />
                        </div>
                        <div className="input-group full">
                            <label>Full Address</label>
                            <textarea 
                                readOnly 
                                rows={2}
                                value={result?.address || ''} 
                                placeholder="Detailed Address" 
                                style={{ resize: 'none' }}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="section-title">
                        <div className="indicator"></div>
                        <h2>Technical Logs</h2>
                    </div>

                    <div className="logs-card">
                        {loading ? (
                            <div>
                                <p style={{ color: '#8b5cf6', fontWeight: 600 }}>Analyzing document structure...</p>
                                <small>Please wait while we extract data using OCR.space Engine</small>
                            </div>
                        ) : result ? (
                            <div className="json-container">
                                <pre style={{ 
                                    margin: 0, 
                                    padding: '1rem', 
                                    color: '#cbd5e1', 
                                    fontSize: '0.875rem',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all'
                                }}>
                                    {JSON.stringify({ success: true, data: result }, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <div>
                                <p>Waiting for data extraction...</p>
                                <small>Upload images on the left to begin the process.</small>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};
