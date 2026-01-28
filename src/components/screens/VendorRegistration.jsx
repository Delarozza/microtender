import React from 'react';
import { ShoppingBag, UserPlus } from 'lucide-react';

const APPLICATION_STATUS = {
  0: { label: 'Čaká na schválenie', color: 'bg-amber-100 text-amber-700' },
  1: { label: 'Schválené', color: 'bg-green-100 text-green-700' },
  2: { label: 'Zamietnuté', color: 'bg-red-100 text-red-700' },
};

export function VendorRegistration({
  account,
  isRegisteredVendor,
  myApplicationStatus,
  vendorApplicationForm,
  setVendorApplicationForm,
  onSubmit,
  loading,
  onNavigate,
}) {
  if (!account) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <UserPlus size={48} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pripojte peňaženku</h2>
          <p className="text-gray-600 mb-4">
            Pre registráciu ako dodávateľ musíte pripojiť svoju peňaženku.
          </p>
          <p className="text-sm text-gray-500">Použite tlačidlo v hlavičke na pripojenie.</p>
        </div>
      </div>
    );
  }

  if (isRegisteredVendor) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
          <ShoppingBag size={48} className="text-green-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Už ste dodávateľ</h2>
          <p className="text-gray-600 mb-4">
            Vaša žiadosť bola schválená. Môžete podávať ponuky na aktívne tendery.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('Všetky tendery')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Zobraziť tendery
          </button>
        </div>
      </div>
    );
  }

  const statusNum =
    myApplicationStatus != null
      ? typeof myApplicationStatus === 'object' && typeof myApplicationStatus.toNumber === 'function'
        ? myApplicationStatus.toNumber()
        : Number(myApplicationStatus)
      : null;
  const statusInfo = statusNum != null ? APPLICATION_STATUS[statusNum] : null;
  const hasPendingApplication = statusNum === 0;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus size={24} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registrácia ako dodávateľ</h1>
              <p className="text-gray-600 text-sm">
                Vyplňte formulár a odošlite žiadosť. Študentská rada ju posúdi a schváli alebo zamietne.
              </p>
            </div>
          </div>

          {statusNum != null && statusInfo && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg ${statusInfo.color} flex items-center justify-between`}
            >
              <span className="font-medium">Stav žiadosti: {statusInfo.label}</span>
              {hasPendingApplication && (
                <span className="text-sm">Čakajte na rozhodnutie rady.</span>
              )}
            </div>
          )}

          {statusNum === 2 && (
            <p className="text-gray-600 text-sm mb-4">
              Vaša predchádzajúca žiadosť bola zamietnutá. Môžete podať novú žiadosť nižšie.
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Názov spoločnosti <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vendorApplicationForm.companyName}
                onChange={(e) =>
                  setVendorApplicationForm({ ...vendorApplicationForm, companyName: e.target.value })
                }
                placeholder="Napríklad: ABC Supplies s.r.o."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={hasPendingApplication}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kontaktné informácie <span className="text-red-500">*</span>
              </label>
              <textarea
                value={vendorApplicationForm.contactInfo}
                onChange={(e) =>
                  setVendorApplicationForm({ ...vendorApplicationForm, contactInfo: e.target.value })
                }
                placeholder="Email, telefón, adresa..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={hasPendingApplication}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popis spoločnosti a skúsenosti
              </label>
              <textarea
                value={vendorApplicationForm.description}
                onChange={(e) =>
                  setVendorApplicationForm({
                    ...vendorApplicationForm,
                    description: e.target.value,
                  })
                }
                placeholder="Stručný popis, oblasť pôsobenia, skúsenosti..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={hasPendingApplication}
              />
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || hasPendingApplication || !vendorApplicationForm.companyName.trim()}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Odosielam...' : 'Odoslať žiadosť'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
