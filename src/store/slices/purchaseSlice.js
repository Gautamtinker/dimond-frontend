import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { purchaseAPI, purchasePaymentAPI } from "../../services/api";

const initialState = {
  purchases: [],
  purchase: null,
  summary: null,
  payments: [],
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 0 },
};

export const getPurchases = createAsyncThunk(
  "purchases/getAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await purchaseAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchases",
      );
    }
  },
);

export const getPurchaseById = createAsyncThunk(
  "purchases/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await purchaseAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch purchase",
      );
    }
  },
);

export const createPurchase = createAsyncThunk(
  "purchases/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await purchaseAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create purchase",
      );
    }
  },
);

export const updatePurchase = createAsyncThunk(
  "purchases/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await purchaseAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update purchase",
      );
    }
  },
);

export const deletePurchase = createAsyncThunk(
  "purchases/delete",
  async (id, { rejectWithValue }) => {
    try {
      await purchaseAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete purchase",
      );
    }
  },
);

export const getPurchaseSummary = createAsyncThunk(
  "purchases/getSummary",
  async (params, { rejectWithValue }) => {
    try {
      const response = await purchaseAPI.getSummary(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch summary",
      );
    }
  },
);

export const getPurchasePayments = createAsyncThunk(
  "purchases/getPayments",
  async (params, { rejectWithValue }) => {
    try {
      const response = await purchasePaymentAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payments",
      );
    }
  },
);

export const createPurchasePayment = createAsyncThunk(
  "purchases/createPayment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await purchasePaymentAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create payment",
      );
    }
  },
);

const purchaseSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {
    clearPurchaseError: (state) => {
      state.error = null;
    },
    resetPurchase: (state) => {
      state.purchase = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Purchases
      .addCase(getPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Purchase By ID
      .addCase(getPurchaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.purchase = action.payload;
      })
      .addCase(getPurchaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Purchase
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.unshift(action.payload);
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Purchase
      .addCase(updatePurchase.fulfilled, (state, action) => {
        const index = state.purchases.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
        if (state.purchase?._id === action.payload._id) {
          state.purchase = action.payload;
        }
      })
      // Delete Purchase
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.purchases = state.purchases.filter(
          (p) => p._id !== action.payload,
        );
      })
      // Get Summary
      .addCase(getPurchaseSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      // Get Payments
      .addCase(getPurchasePayments.fulfilled, (state, action) => {
        state.payments = action.payload.data;
      })
      // Create Payment
      .addCase(createPurchasePayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
        // Update purchase in state if it exists
        if (state.purchase && state.purchase._id === action.payload.purchase) {
          state.purchase.outstandingAmount -= action.payload.amount;
          state.purchase.totalPaidAmount += action.payload.amount;
        }
      });
  },
});

export const { clearPurchaseError, resetPurchase } = purchaseSlice.actions;
export default purchaseSlice.reducer;
