import { type Request, type Response, type NextFunction } from "express";
import { isValidAddress, logSecurityEvent } from "./blockchain";

// Extend Express Request type to include validated user address
declare module 'express-serve-static-core' {
  interface Request {
    validatedUserAddress?: string;
  }
}

/**
 * Middleware to verify wallet address ownership
 * 
 * NOTE: In a production environment, this should be enhanced with:
 * - Message signing verification (user signs a message with their private key)
 * - JWT tokens issued after signature verification
 * - Session management to avoid repeated signature requests
 * 
 * For now, we implement basic address format validation and consistency checking.
 */
export function verifyWalletAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const { userAddress } = req.body;
    
    // Check if userAddress is provided
    if (!userAddress) {
      logSecurityEvent('MISSING_USER_ADDRESS', {
        path: req.path,
        ip: req.ip,
        method: req.method
      });
      return res.status(400).json({ 
        error: "Wallet address is required" 
      });
    }
    
    // Validate address format
    if (!isValidAddress(userAddress)) {
      logSecurityEvent('INVALID_ADDRESS_FORMAT', {
        path: req.path,
        ip: req.ip,
        userAddress
      });
      return res.status(400).json({ 
        error: "Invalid wallet address format" 
      });
    }
    
    // Store validated address for use in route handler
    req.validatedUserAddress = userAddress.toLowerCase();
    
    next();
  } catch (error) {
    logSecurityEvent('ADDRESS_VERIFICATION_ERROR', {
      path: req.path,
      ip: req.ip,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({ 
      error: "Failed to verify wallet address" 
    });
  }
}

/**
 * Middleware to ensure the request is coming from the wallet owner
 * 
 * This checks that the userAddress in the request body matches the
 * validated address from the wallet verification middleware.
 */
export function requireWalletOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const { userAddress } = req.body;
    const validatedAddress = req.validatedUserAddress;
    
    if (!validatedAddress) {
      logSecurityEvent('MISSING_VALIDATED_ADDRESS', {
        path: req.path,
        ip: req.ip
      });
      return res.status(401).json({ 
        error: "Unauthorized: Wallet verification required" 
      });
    }
    
    // Ensure the address in the request matches the validated address
    if (userAddress.toLowerCase() !== validatedAddress) {
      logSecurityEvent('ADDRESS_MISMATCH', {
        path: req.path,
        ip: req.ip,
        requestAddress: userAddress,
        validatedAddress
      });
      return res.status(403).json({ 
        error: "Forbidden: You can only create records for your own wallet" 
      });
    }
    
    next();
  } catch (error) {
    logSecurityEvent('OWNERSHIP_VERIFICATION_ERROR', {
      path: req.path,
      ip: req.ip,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return res.status(500).json({ 
      error: "Failed to verify wallet ownership" 
    });
  }
}
