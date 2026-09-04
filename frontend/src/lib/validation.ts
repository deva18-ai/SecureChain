import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const fullNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
  .optional()
  .or(z.literal(''));

export const didSchema = z
  .string()
  .regex(/^did:securechain:[a-fA-F0-9]{32}$/, 'Invalid DID format. Must be did:securechain:<32-char-hex>');

export const assetIdSchema = z
  .string()
  .min(1, 'Asset ID is required')
  .max(100, 'Asset ID must be less than 100 characters')
  .regex(/^[A-Z0-9-_]+$/, 'Asset ID can only contain uppercase letters, numbers, hyphens, and underscores');

export const assetNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(255, 'Name must be less than 255 characters');

export const assetDescriptionSchema = z
  .string()
  .max(2000, 'Description must be less than 2000 characters')
  .optional();

export const assetCategorySchema = z
  .string()
  .min(1, 'Category is required')
  .max(100, 'Category must be less than 100 characters');

export const metadataUriSchema = z
  .string()
  .url('Metadata URI must be a valid URL')
  .or(z.string().regex(/^ipfs:\/\//, 'Must be a valid IPFS URI'))
  .optional();

export const transferReasonSchema = z
  .string()
  .min(10, 'Reason must be at least 10 characters')
  .max(500, 'Reason must be less than 500 characters');

export const rejectionReasonSchema = z
  .string()
  .min(10, 'Rejection reason must be at least 10 characters')
  .max(500, 'Rejection reason must be less than 500 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: emailSchema,
  full_name: fullNameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  wallet_address: walletAddressSchema,
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const createDIDSchema = z.object({
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export const createAssetSchema = z.object({
  asset_id: assetIdSchema,
  name: assetNameSchema,
  description: assetDescriptionSchema,
  category: assetCategorySchema,
  metadata_uri: metadataUriSchema,
  initial_owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export const allocateAssetSchema = z.object({
  token_id: z.number().positive('Token ID must be positive'),
  to_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export const transferAssetSchema = z.object({
  token_id: z.number().positive('Token ID must be positive'),
  to_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export const createTransferSchema = z.object({
  asset_id: z.number().positive('Asset is required'),
  recipient_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid recipient address'),
  reason: transferReasonSchema,
});

export const approveTransferSchema = z.object({
  transfer_id: z.number().positive('Transfer ID is required'),
});

export const rejectTransferSchema = z.object({
  transfer_id: z.number().positive('Transfer ID is required'),
  reason: rejectionReasonSchema,
});

export const updateUserSchema = z.object({
  full_name: fullNameSchema.optional(),
  email: emailSchema.optional(),
  wallet_address: walletAddressSchema,
  is_active: z.boolean().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'AUDITOR', 'USER']).optional(),
});

export const assignRoleSchema = z.object({
  user_id: z.number().positive('User ID is required'),
  role: z.enum(['MANAGER', 'AUDITOR', 'MINTER', 'IDENTITY_VERIFIER']),
});

export const verifyAuditSchema = z.object({
  tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional(),
  audit_id: z.number().positive().optional(),
  resource_type: z.string().min(1).optional(),
  resource_id: z.string().min(1).optional(),
}).refine(data => data.tx_hash || data.audit_id || (data.resource_type && data.resource_id), {
  message: 'At least one verification parameter is required',
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateDIDInput = z.infer<typeof createDIDSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type AllocateAssetInput = z.infer<typeof allocateAssetSchema>;
export type TransferAssetInput = z.infer<typeof transferAssetSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type ApproveTransferInput = z.infer<typeof approveTransferSchema>;
export type RejectTransferInput = z.infer<typeof rejectTransferSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type VerifyAuditInput = z.infer<typeof verifyAuditSchema>;

export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return { success: false, errors };
}

export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateForm(schema, data);
}

export const formValidators = {
  login: createFormValidator(loginSchema),
  register: createFormValidator(registerSchema),
  changePassword: createFormValidator(changePasswordSchema),
  createDID: createFormValidator(createDIDSchema),
  createAsset: createFormValidator(createAssetSchema),
  allocateAsset: createFormValidator(allocateAssetSchema),
  transferAsset: createFormValidator(transferAssetSchema),
  createTransfer: createFormValidator(createTransferSchema),
  approveTransfer: createFormValidator(approveTransferSchema),
  rejectTransfer: createFormValidator(rejectTransferSchema),
  updateUser: createFormValidator(updateUserSchema),
  assignRole: createFormValidator(assignRoleSchema),
  verifyAudit: createFormValidator(verifyAuditSchema),
};

export function getFieldError(errors: Record<string, string[]>, fieldName: string): string | undefined {
  return errors[fieldName]?.[0];
}

export function hasFieldError(errors: Record<string, string[]>, fieldName: string): boolean {
  return !!errors[fieldName]?.length;
}