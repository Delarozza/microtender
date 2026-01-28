import React, { useEffect } from 'react';
import { Shield, CheckCircle, XCircle, UserMinus } from 'lucide-react';

const STATUS_LABELS = {
  0: 'Čaká na schválenie',
  1: 'Schválené',
  2: 'Zamietnuté',
};

export function VendorApproval({
  vendorApplications,
  loading,
  onApprove,
  onReject,
  onRevoke,
  onLoad,
  isMember,
}) {
  useEffect(() => {
    if (onLoad && isMember) onLoad();
  }, [onLoad, isMember]);

  const toStatus = (s) => (typeof s === 'object' && s?.toNumber ? s.toNumber() : Number(s));
  const pending = vendorApplications.filter((app) => toStatus(app.status) === 0);
  const approved = vendorApplications.filter((app) => toStatus(app.status) === 1);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Shield size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Žiadosti dodávateľov</h1>
            <p className="text-gray-600 text-sm">
              Schvaľujte alebo zamietajte žiadosti o registráciu. Môžete tiež odvolať status
              schváleného dodávateľa.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200">
              Žiadosti na schválenie ({pending.length})
            </h2>
            <div className="p-6">
              {pending.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Žiadne žiadosti na schválenie</p>
              ) : (
                <div className="space-y-4">
                  {pending.map((app) => (
                    <div
                      key={app.id}
                      className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{app.companyName}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Adresa: {String(app.applicant).slice(0, 6)}...
                            {String(app.applicant).slice(-4)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Podané:{' '}
                            {new Date(parseInt(app.submittedAt, 10) * 1000).toLocaleDateString(
                              'sk-SK'
                            )}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                          {STATUS_LABELS[toStatus(app.status)]}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Kontakt</p>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {app.contactInfo || '—'}
                          </p>
                        </div>
                        {app.description && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">Popis</p>
                            <p className="text-sm text-gray-700">{app.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => onApprove(app.id)}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={18} />
                          Schváliť
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(app.id)}
                          disabled={loading}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={18} />
                          Zamietnuť
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200">
              Schválení dodávatelia ({approved.length})
            </h2>
            <div className="p-6">
              {approved.length === 0 ? (
                <p className="text-gray-500 text-center py-6">Žiadni schválení dodávatelia</p>
              ) : (
                <div className="space-y-3">
                  {approved.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between py-3 px-4 bg-green-50 border border-green-100 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{app.companyName}</p>
                        <p className="text-xs text-gray-500">
                          {String(app.applicant).slice(0, 6)}...{String(app.applicant).slice(-4)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRevoke(app.applicant)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <UserMinus size={16} />
                        Odvolať status
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
