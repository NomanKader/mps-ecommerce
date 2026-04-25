import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { mockTenant } from '@shared/lib/mockData';
import type { Tenant } from '@entities/tenant/types/tenant.types';

type TenantState = {
  activeTenant: Tenant | null;
  availablePlans: Array<'starter' | 'growth' | 'enterprise'>;
  onboardingStatus: 'not_started' | 'in_progress' | 'completed';
};

const initialState: TenantState = {
  activeTenant: mockTenant,
  availablePlans: ['starter', 'growth', 'enterprise'],
  onboardingStatus: 'in_progress',
};

const tenantSlice = createSlice({
  initialState,
  name: 'tenant',
  reducers: {
    setActiveTenant(state, action: PayloadAction<Tenant | null>) {
      state.activeTenant = action.payload;
    },
  },
});

export const { setActiveTenant } = tenantSlice.actions;
export const tenantReducer = tenantSlice.reducer;
