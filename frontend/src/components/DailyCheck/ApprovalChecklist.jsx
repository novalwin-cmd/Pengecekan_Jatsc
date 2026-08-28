/**
 * ApprovalChecklist Component
 * Two-level approval workflow: Supervisor → Technical Manager
 * Includes name fields and signature capture
 */

import { useState, useRef, useEffect } from 'react';
import { useApiPost } from '../../hooks/useApi';
import Toast from '../Toast';
import './ApprovalChecklist.css';

const ApprovalChecklist = ({ checkId, checkData, onApprovalChange }) => {
  // State
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorSignature, setSupervisorSignature] = useState(null);
  const [supervisorSignaturePreview, setSupervisorSignaturePreview] = useState(null);

  const [technicalManagerName, setTechnicalManagerName] = useState('');
  const [technicalManagerSignature, setTechnicalManagerSignature] = useState(null);
  const [technicalManagerSignaturePreview, setTechnicalManagerSignaturePreview] = useState(null);

  const [supervisorApproving, setSupervisorApproving] = useState(false);
  const [technicalManagerApproving, setTechnicalManagerApproving] = useState(false);
  const [toast, setToast] = useState(null);

  // Canvas refs for signature capture
  const supervisorCanvasRef = useRef(null);
  const technicalManagerCanvasRef = useRef(null);

  // Signature drawing state
  const [isDrawingSupervisor, setIsDrawingSupervisor] = useState(false);
  const [isDrawingTechManager, setIsDrawingTechManager] = useState(false);

  // API hooks
  const { post: approveSupervisor } = useApiPost();
  const { post: approveTechnicalManager } = useApiPost();

  // Initialize from checkData
  useEffect(() => {
    if (checkData) {
      if (checkData.supervisor_name) setSupervisorName(checkData.supervisor_name);
      if (checkData.supervisor_signature) setSupervisorSignaturePreview(checkData.supervisor_signature);
      if (checkData.technical_manager_name) setTechnicalManagerName(checkData.technical_manager_name);
      if (checkData.technical_manager_signature) setTechnicalManagerSignaturePreview(checkData.technical_manager_signature);
    }
  }, [checkData]);

  // =========================================================================
  // SIGNATURE DRAWING FUNCTIONS
  // =========================================================================

  const startDrawing = (e, isManager = false) => {
    const canvas = isManager ? technicalManagerCanvasRef.current : supervisorCanvasRef.current;
    if (!canvas) return;

    if (isManager) setIsDrawingTechManager(true);
    else setIsDrawingSupervisor(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e, isManager = false) => {
    const isDrawing = isManager ? isDrawingTechManager : isDrawingSupervisor;
    if (!isDrawing) return;

    const canvas = isManager ? technicalManagerCanvasRef.current : supervisorCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e, isManager = false) => {
    if (isManager) setIsDrawingTechManager(false);
    else setIsDrawingSupervisor(false);
  };

  const captureSignature = (isManager = false) => {
    const canvas = isManager ? technicalManagerCanvasRef.current : supervisorCanvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');

    if (isManager) {
      setTechnicalManagerSignature(signatureData);
      setTechnicalManagerSignaturePreview(signatureData);
    } else {
      setSupervisorSignature(signatureData);
      setSupervisorSignaturePreview(signatureData);
    }
  };

  const clearCanvas = (isManager = false) => {
    const canvas = isManager ? technicalManagerCanvasRef.current : supervisorCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isManager) {
      setTechnicalManagerSignature(null);
      setTechnicalManagerSignaturePreview(null);
    } else {
      setSupervisorSignature(null);
      setSupervisorSignaturePreview(null);
    }
  };

  // =========================================================================
  // APPROVAL HANDLERS
  // =========================================================================

  const handleSupervisorApproval = async () => {
    if (!supervisorName.trim()) {
      setToast({ type: 'error', message: '❌ Please enter Supervisor name' });
      return;
    }

    if (!supervisorSignaturePreview) {
      setToast({ type: 'error', message: '❌ Please capture Supervisor signature' });
      return;
    }

    setSupervisorApproving(true);

    try {
      const result = await approveSupervisor(`/daily-check/${checkId}/approve-supervisor`, {
        supervisor_approved: true,
        supervisor_name: supervisorName,
        supervisor_signature: supervisorSignaturePreview
      });

      if (result?.success) {
        setToast({
          type: 'success',
          message: '✅ Supervisor approval confirmed'
        });
        if (onApprovalChange) onApprovalChange();
      } else {
        throw new Error(result?.error || 'Failed to save approval');
      }
    } catch (error) {
      console.error('Error in supervisor approval:', error);
      setToast({
        type: 'error',
        message: `❌ Failed: ${error.message}`
      });
    } finally {
      setSupervisorApproving(false);
    }
  };

  const handleTechnicalManagerApproval = async () => {
    if (!checkData?.supervisor_approved) {
      setToast({ type: 'error', message: '❌ Supervisor must approve first' });
      return;
    }

    if (!technicalManagerName.trim()) {
      setToast({ type: 'error', message: '❌ Please enter Technical Manager name' });
      return;
    }

    if (!technicalManagerSignaturePreview) {
      setToast({ type: 'error', message: '❌ Please capture Technical Manager signature' });
      return;
    }

    setTechnicalManagerApproving(true);

    try {
      const result = await approveTechnicalManager(`/daily-check/${checkId}/approve-technical-manager`, {
        technical_manager_approved: true,
        technical_manager_name: technicalManagerName,
        technical_manager_signature: technicalManagerSignaturePreview
      });

      if (result?.success) {
        setToast({
          type: 'success',
          message: '✅ Technical Manager approval confirmed'
        });
        if (onApprovalChange) onApprovalChange();
      } else {
        throw new Error(result?.error || 'Failed to save approval');
      }
    } catch (error) {
      console.error('Error in technical manager approval:', error);
      setToast({
        type: 'error',
        message: `❌ Failed: ${error.message}`
      });
    } finally {
      setTechnicalManagerApproving(false);
    }
  };

  const handleRemoveSupervisorApproval = async () => {
    if (!window.confirm('Remove Supervisor approval?')) return;

    setSupervisorApproving(true);

    try {
      const result = await approveSupervisor(`/daily-check/${checkId}/approve-supervisor`, {
        supervisor_approved: false
      });

      if (result?.success) {
        setSupervisorName('');
        setSupervisorSignature(null);
        setSupervisorSignaturePreview(null);
        setToast({ type: 'success', message: '✅ Supervisor approval removed' });
        if (onApprovalChange) onApprovalChange();
      }
    } catch (error) {
      setToast({ type: 'error', message: '❌ Failed to remove approval' });
    } finally {
      setSupervisorApproving(false);
    }
  };

  const handleRemoveTechnicalManagerApproval = async () => {
    if (!window.confirm('Remove Technical Manager approval?')) return;

    setTechnicalManagerApproving(true);

    try {
      const result = await approveTechnicalManager(`/daily-check/${checkId}/approve-technical-manager`, {
        technical_manager_approved: false
      });

      if (result?.success) {
        setTechnicalManagerName('');
        setTechnicalManagerSignature(null);
        setTechnicalManagerSignaturePreview(null);
        setToast({ type: 'success', message: '✅ Technical Manager approval removed' });
        if (onApprovalChange) onApprovalChange();
      }
    } catch (error) {
      setToast({ type: 'error', message: '❌ Failed to remove approval' });
    } finally {
      setTechnicalManagerApproving(false);
    }
  };

  const isSupervisorApproved = checkData?.supervisor_approved;
  const isTechnicalManagerApproved = checkData?.technical_manager_approved;
  const bothApproved = isSupervisorApproved && isTechnicalManagerApproved;

  return (
    <div className="approval-checklist-container">
      <div className="approval-header">
        <h3>✅ Approval Checklist</h3>
        <p className="approval-subtitle">Supervisor → Technical Manager (2-step approval required for PDF export)</p>
      </div>

      {bothApproved && (
        <div className="approval-complete-banner">
          <span className="banner-icon">🎉</span>
          <span className="banner-text">All approvals completed - PDF export is now available</span>
        </div>
      )}

      {/* SUPERVISOR APPROVAL SECTION */}
      <div className="approval-section supervisor-section">
        <div className="approval-section-header">
          <div className="approval-title">
            <span className={`approval-number ${isSupervisorApproved ? 'completed' : ''}`}>1</span>
            <h4>Supervisor Approval</h4>
          </div>
          {isSupervisorApproved && (
            <div className="approval-badge approved">✓ Approved</div>
          )}
        </div>

        {!isSupervisorApproved ? (
          <div className="approval-form">
            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="supervisor-name">Supervisor Name *</label>
              <input
                id="supervisor-name"
                type="text"
                placeholder="Enter full name"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Signature Capture */}
            <div className="form-group">
              <label>Supervisor Signature *</label>
              <div className="signature-capture-section">
                <canvas
                  ref={supervisorCanvasRef}
                  width={400}
                  height={150}
                  className="signature-canvas"
                  onMouseDown={(e) => startDrawing(e, false)}
                  onMouseMove={(e) => draw(e, false)}
                  onMouseUp={(e) => stopDrawing(e, false)}
                  onMouseLeave={(e) => stopDrawing(e, false)}
                />
                <p className="signature-hint">Draw signature above</p>
              </div>

              <div className="signature-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => clearCanvas(false)}
                >
                  🗑️ Clear
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  onClick={() => captureSignature(false)}
                >
                  📸 Capture
                </button>
              </div>

              {supervisorSignaturePreview && (
                <div className="signature-preview">
                  <p className="preview-label">Signature captured ✓</p>
                  <img src={supervisorSignaturePreview} alt="Supervisor signature preview" />
                </div>
              )}
            </div>

            {/* Approval Button */}
            <button
              type="button"
              className="btn btn-success btn-block"
              onClick={handleSupervisorApproval}
              disabled={supervisorApproving || !supervisorName.trim() || !supervisorSignaturePreview}
            >
              {supervisorApproving ? (
                <>
                  <span className="spinner"></span>
                  Approving...
                </>
              ) : (
                <>👤 Approve as Supervisor</>
              )}
            </button>
          </div>
        ) : (
          <div className="approval-display">
            <div className="approval-info-row">
              <span className="label">Name:</span>
              <span className="value">{checkData.supervisor_name}</span>
            </div>
            <div className="approval-info-row">
              <span className="label">Approved:</span>
              <span className="value">
                {new Date(checkData.supervisor_approved_at).toLocaleString('id-ID')}
              </span>
            </div>
            {checkData.supervisor_signature && (
              <div className="approval-signature-display">
                <img
                  src={checkData.supervisor_signature}
                  alt="Supervisor signature"
                  className="signature-img"
                />
              </div>
            )}
            <button
              type="button"
              className="btn btn-danger btn-small"
              onClick={handleRemoveSupervisorApproval}
              disabled={supervisorApproving}
            >
              🔄 Remove Approval
            </button>
          </div>
        )}
      </div>

      {/* TECHNICAL MANAGER APPROVAL SECTION */}
      <div className={`approval-section technical-manager-section ${!isSupervisorApproved ? 'disabled' : ''}`}>
        <div className="approval-section-header">
          <div className="approval-title">
            <span className={`approval-number ${isTechnicalManagerApproved ? 'completed' : ''}`}>2</span>
            <h4>Technical Manager Approval</h4>
          </div>
          {isTechnicalManagerApproved && (
            <div className="approval-badge approved">✓ Approved</div>
          )}
          {!isSupervisorApproved && (
            <div className="approval-badge pending">⏳ Waiting for Supervisor</div>
          )}
        </div>

        {!isSupervisorApproved ? (
          <div className="approval-disabled-message">
            <span className="icon">🔒</span>
            <p>This step is locked until Supervisor approves the daily check</p>
          </div>
        ) : !isTechnicalManagerApproved ? (
          <div className="approval-form">
            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="tech-manager-name">Technical Manager Name *</label>
              <input
                id="tech-manager-name"
                type="text"
                placeholder="Enter full name"
                value={technicalManagerName}
                onChange={(e) => setTechnicalManagerName(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Signature Capture */}
            <div className="form-group">
              <label>Technical Manager Signature *</label>
              <div className="signature-capture-section">
                <canvas
                  ref={technicalManagerCanvasRef}
                  width={400}
                  height={150}
                  className="signature-canvas"
                  onMouseDown={(e) => startDrawing(e, true)}
                  onMouseMove={(e) => draw(e, true)}
                  onMouseUp={(e) => stopDrawing(e, true)}
                  onMouseLeave={(e) => stopDrawing(e, true)}
                />
                <p className="signature-hint">Draw signature above</p>
              </div>

              <div className="signature-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => clearCanvas(true)}
                >
                  🗑️ Clear
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  onClick={() => captureSignature(true)}
                >
                  📸 Capture
                </button>
              </div>

              {technicalManagerSignaturePreview && (
                <div className="signature-preview">
                  <p className="preview-label">Signature captured ✓</p>
                  <img src={technicalManagerSignaturePreview} alt="Technical Manager signature preview" />
                </div>
              )}
            </div>

            {/* Approval Button */}
            <button
              type="button"
              className="btn btn-success btn-block"
              onClick={handleTechnicalManagerApproval}
              disabled={technicalManagerApproving || !technicalManagerName.trim() || !technicalManagerSignaturePreview}
            >
              {technicalManagerApproving ? (
                <>
                  <span className="spinner"></span>
                  Approving...
                </>
              ) : (
                <>👔 Approve as Technical Manager</>
              )}
            </button>
          </div>
        ) : (
          <div className="approval-display">
            <div className="approval-info-row">
              <span className="label">Name:</span>
              <span className="value">{checkData.technical_manager_name}</span>
            </div>
            <div className="approval-info-row">
              <span className="label">Approved:</span>
              <span className="value">
                {new Date(checkData.technical_manager_approved_at).toLocaleString('id-ID')}
              </span>
            </div>
            {checkData.technical_manager_signature && (
              <div className="approval-signature-display">
                <img
                  src={checkData.technical_manager_signature}
                  alt="Technical Manager signature"
                  className="signature-img"
                />
              </div>
            )}
            <button
              type="button"
              className="btn btn-danger btn-small"
              onClick={handleRemoveTechnicalManagerApproval}
              disabled={technicalManagerApproving}
            >
              🔄 Remove Approval
            </button>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ApprovalChecklist;
