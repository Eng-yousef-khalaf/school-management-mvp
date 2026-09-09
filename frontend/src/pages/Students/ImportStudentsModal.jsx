import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ErrorAlert from '../../components/common/ErrorAlert';
import { UploadIcon, DownloadIcon, CheckIcon, AlertCircleIcon } from '../../components/common/Icons';

export default function ImportStudentsModal({ isOpen, onClose, onImported }) {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewData(null);
      setError('');
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Please select an Excel or CSV file');
      return;
    }

    setPreviewing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/students/import/preview', formData);
      setPreviewData(res);
      if (res.validCount === 0) {
        toast.warning('No valid rows found to import.');
      } else {
        toast.info(`Parsed ${res.totalRows} rows: ${res.validCount} valid, ${res.invalidCount} invalid, ${res.duplicateCount} duplicates.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to parse Excel file');
    } finally {
      setPreviewing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!previewData || !previewData.validRows || previewData.validRows.length === 0) {
      setError('No valid rows available to import');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const res = await api.post('/students/import/execute', { validRows: previewData.validRows });
      toast.success(`Successfully imported ${res.createdCount} students!`);
      onImported();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to execute import');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const sampleHeaders = 'studentNumber,firstName,middleName,lastName,gender,dateOfBirth,phone,parentName,parentPhone,address\nSTU-2026-901,Ahmad,Ali,Mansour,MALE,2013-05-15,+962 7 9100 5001,Ali Mansour,+962 7 8800 5001,Amman 7th Circle\nSTU-2026-902,Sara,Tariq,Haddad,FEMALE,2013-08-22,+962 7 9100 5002,Tariq Haddad,+962 7 8800 5002,Amman Abdoun';
    const blob = new Blob([sampleHeaders], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Students from Excel / CSV"
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={importing}>
            Cancel
          </button>
          {previewData && previewData.validCount > 0 && (
            <button
              className="btn btn-primary"
              onClick={handleExecuteImport}
              disabled={importing}
            >
              {importing ? 'Importing Students...' : `Import ${previewData.validCount} Valid Students`}
            </button>
          )}
        </>
      }
    >
      {error && <ErrorAlert message={error} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Upload a <code>.xlsx</code> or <code>.csv</code> spreadsheet containing student records.
        </p>
        <button className="btn btn-secondary btn-sm" type="button" onClick={downloadTemplate}>
          <DownloadIcon /> Download CSV Template
        </button>
      </div>

      <div
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          textAlign: 'center',
          background: '#f8fafc',
          marginBottom: 20
        }}
      >
        <UploadIcon style={{ width: 36, height: 36, color: 'var(--primary)', marginBottom: 8 }} />
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
          {file ? file.name : 'Choose an Excel or CSV file to inspect'}
        </div>
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="fileUploadInput"
        />
        <label htmlFor="fileUploadInput" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', marginTop: 10 }}>
          Browse File
        </label>
        {file && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handlePreview}
            disabled={previewing}
            style={{ marginLeft: 10 }}
          >
            {previewing ? 'Inspecting File...' : 'Validate & Preview'}
          </button>
        )}
      </div>

      {previewData && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>TOTAL ROWS</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{previewData.totalRows}</div>
            </div>
            <div style={{ background: 'var(--success-light)', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, color: '#166534' }}>VALID READY</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>{previewData.validCount}</div>
            </div>
            <div style={{ background: 'var(--danger-light)', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: 11, color: '#991b1b' }}>INVALID ERRORS</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--danger)' }}>{previewData.invalidCount}</div>
            </div>
            <div style={{ background: 'var(--warning-light)', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid #fed7aa' }}>
              <div style={{ fontSize: 11, color: '#9a3412' }}>DUPLICATES</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--warning)' }}>{previewData.duplicateCount}</div>
            </div>
          </div>

          <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
            <table style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Student Number</th>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>Validation Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.validRows.map((r) => (
                  <tr key={`v-${r.rowNum}`}>
                    <td>{r.rowNum}</td>
                    <td><strong>{r.studentNumber}</strong></td>
                    <td>{r.firstName} {r.lastName}</td>
                    <td>{r.gender || '—'}</td>
                    <td>
                      <span className="badge badge-active" style={{ fontSize: 11 }}>
                        <CheckIcon /> Valid
                      </span>
                    </td>
                  </tr>
                ))}
                {previewData.invalidRows.map((r) => (
                  <tr key={`inv-${r.rowNum}`} style={{ background: 'var(--danger-light)' }}>
                    <td>{r.rowNum}</td>
                    <td>{r.studentNumber || 'Missing'}</td>
                    <td>{r.firstName} {r.lastName}</td>
                    <td>{r.gender}</td>
                    <td>
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                        {r.errors.join(', ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {previewData.duplicateRows.map((r) => (
                  <tr key={`dup-${r.rowNum}`} style={{ background: 'var(--warning-light)' }}>
                    <td>{r.rowNum}</td>
                    <td>{r.studentNumber}</td>
                    <td>{r.firstName} {r.lastName}</td>
                    <td>{r.gender}</td>
                    <td>
                      <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                        {r.errors.join(', ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}
