import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { approvalAPI } from "../../services/api";

const initialState = {
  approvals: [],
  approval: null,
  pendingSummary: null,
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 0 },
};

export const getApprovals = createAsyncThunk(
  "approvals/getAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await approvalAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch approvals",
      );
    }
  },
);

export const getApprovalById = createAsyncThunk(
  "approvals/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await approvalAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch approval",
      );
    }
  },
);

export const createApproval = createAsyncThunk(
  "approvals/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await approvalAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create approval",
      );
    }
  },
);

export const updateApproval = createAsyncThunk(
  "approvals/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await approvalAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update approval",
      );
    }
  },
);

export const deleteApproval = createAsyncThunk(
  "approvals/delete",
  async (id, { rejectWithValue }) => {
    try {
      await approvalAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete approval",
      );
    }
  },
);

export const markMaterialAsSold = createAsyncThunk(
  "approvals/markSold",
  async ({ approvalId, materialId, data }, { rejectWithValue }) => {
    try {
      const response = await approvalAPI.markMaterialAsSold(
        approvalId,
        materialId,
        data,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as sold",
      );
    }
  },
);

export const markMaterialAsReturned = createAsyncThunk(
  "approvals/markReturned",
  async ({ approvalId, materialId }, { rejectWithValue }) => {
    try {
      const response = await approvalAPI.markMaterialAsReturned(
        approvalId,
        materialId,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as returned",
      );
    }
  },
);

export const getPendingApprovalsSummary = createAsyncThunk(
  "approvals/getPendingSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await approvalAPI.getPendingSummary();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending summary",
      );
    }
  },
);

const approvalSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    clearApprovalError: (state) => {
      state.error = null;
    },
    resetApproval: (state) => {
      state.approval = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Approvals
      .addCase(getApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.approvals = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Approval By ID
      .addCase(getApprovalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApprovalById.fulfilled, (state, action) => {
        state.loading = false;
        state.approval = action.payload;
      })
      .addCase(getApprovalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Approval
      .addCase(createApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApproval.fulfilled, (state, action) => {
        state.loading = false;
        state.approvals.unshift(action.payload);
      })
      .addCase(createApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Approval
      .addCase(updateApproval.fulfilled, (state, action) => {
        const index = state.approvals.findIndex(
          (a) => a._id === action.payload._id,
        );
        if (index !== -1) {
          state.approvals[index] = action.payload;
        }
        if (state.approval?._id === action.payload._id) {
          state.approval = action.payload;
        }
      })
      // Delete Approval
      .addCase(deleteApproval.fulfilled, (state, action) => {
        state.approvals = state.approvals.filter(
          (a) => a._id !== action.payload,
        );
      })
      // Mark as Sold
      .addCase(markMaterialAsSold.fulfilled, (state, action) => {
        const { approval } = action.payload;
        const index = state.approvals.findIndex((a) => a._id === approval._id);
        if (index !== -1) {
          state.approvals[index] = approval;
        }
        if (state.approval?._id === approval._id) {
          state.approval = approval;
        }
      })
      // Mark as Returned
      .addCase(markMaterialAsReturned.fulfilled, (state, action) => {
        const index = state.approvals.findIndex(
          (a) => a._id === action.payload._id,
        );
        if (index !== -1) {
          state.approvals[index] = action.payload;
        }
        if (state.approval?._id === action.payload._id) {
          state.approval = action.payload;
        }
      })
      // Get Pending Summary
      .addCase(getPendingApprovalsSummary.fulfilled, (state, action) => {
        state.pendingSummary = action.payload;
      });
  },
});

export const { clearApprovalError, resetApproval } = approvalSlice.actions;
export default approvalSlice.reducer;
