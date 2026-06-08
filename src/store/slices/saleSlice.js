import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { saleAPI, salePaymentAPI } from "../../services/api";

const initialState = {
  sales: [],
  sale: null,
  summary: null,
  payments: [],
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 0 },
};

export const getSales = createAsyncThunk(
  "sales/getAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await saleAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sales",
      );
    }
  },
);

export const getSaleById = createAsyncThunk(
  "sales/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await saleAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sale",
      );
    }
  },
);

export const createSale = createAsyncThunk(
  "sales/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await saleAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create sale",
      );
    }
  },
);

export const updateSale = createAsyncThunk(
  "sales/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await saleAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update sale",
      );
    }
  },
);

export const deleteSale = createAsyncThunk(
  "sales/delete",
  async (id, { rejectWithValue }) => {
    try {
      await saleAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete sale",
      );
    }
  },
);

export const getSaleSummary = createAsyncThunk(
  "sales/getSummary",
  async (params, { rejectWithValue }) => {
    try {
      const response = await saleAPI.getSummary(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch summary",
      );
    }
  },
);

export const createSalePayment = createAsyncThunk(
  "sales/createPayment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await salePaymentAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create payment",
      );
    }
  },
);

const saleSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    clearSaleError: (state) => {
      state.error = null;
    },
    resetSale: (state) => {
      state.sale = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Sales
      .addCase(getSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Sale By ID
      .addCase(getSaleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.sale = action.payload;
      })
      .addCase(getSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload);
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Sale
      .addCase(updateSale.fulfilled, (state, action) => {
        const index = state.sales.findIndex(
          (s) => s._id === action.payload._id,
        );
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.sale?._id === action.payload._id) {
          state.sale = action.payload;
        }
      })
      // Delete Sale
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.sales = state.sales.filter((s) => s._id !== action.payload);
      })
      // Get Summary
      .addCase(getSaleSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      // Create Payment
      .addCase(createSalePayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
        if (state.sale && state.sale._id === action.payload.sale) {
          state.sale.outstandingAmount -= action.payload.amount;
          state.sale.totalReceivedAmount += action.payload.amount;
        }
      });
  },
});

export const { clearSaleError, resetSale } = saleSlice.actions;
export default saleSlice.reducer;
