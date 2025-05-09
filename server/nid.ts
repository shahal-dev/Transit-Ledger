import { Express } from "express";

// Mock NID database for verification
// This simulates a national database of registered citizens
interface MockNIDRecord {
  nidNumber: string;
  fullName: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
  address?: string;
  gender?: 'male' | 'female' | 'other';
  registrationDate?: string;
  issuedBy?: string;
  isActive: boolean;
}

// Create a mock database with some predefined NID records
// In a real application, this would be data from the actual Bangladesh NID database
const mockNIDDatabase: MockNIDRecord[] = [
  {
    nidNumber: "1234567890",
    fullName: "shahal",
    dateOfBirth: "2003-05-15",
    address: "123 Main Street, Dhaka",
    gender: "male",
    registrationDate: "2010-03-20",
    issuedBy: "Dhaka North",
    isActive: true
  },
  {
    nidNumber: "9876543210",
    fullName: "anika",
    dateOfBirth: "2003-01-25",
    address: "456 Park Road, Chittagong",
    gender: "female",
    registrationDate: "2012-07-12",
    issuedBy: "Chittagong City",
    isActive: true
  },
  {
    nidNumber: "5678901234",
    fullName: "Mohammed Islam",
    dateOfBirth: "1975-12-03",
    address: "789 Lake View, Sylhet",
    gender: "male",
    registrationDate: "2008-11-30",
    issuedBy: "Sylhet District",
    isActive: true
  },
  {
    nidNumber: "2468135790",
    fullName: "Nusrat Jahan",
    dateOfBirth: "1995-02-18",
    address: "567 Hill Road, Rajshahi",
    gender: "female",
    registrationDate: "2015-09-05",
    issuedBy: "Rajshahi Division",
    isActive: true
  },
  {
    nidNumber: "1357924680",
    fullName: "Kamal Hossain",
    dateOfBirth: "1982-07-30",
    address: "890 River Lane, Khulna",
    gender: "male",
    registrationDate: "2011-04-15",
    issuedBy: "Khulna District",
    isActive: true
  },
  // Inactive or problematic record for testing negative cases
  {
    nidNumber: "9999999999",
    fullName: "Test User",
    dateOfBirth: "2000-01-01",
    isActive: false
  }
];

// Helper function to check if a NID exists and is valid
function validateNIDRecord(nidNumber: string, fullName: string, dateOfBirth: string): { 
  isValid: boolean; 
  message: string;
  record?: MockNIDRecord;
} {
  // Find the record in our mock database
  const record = mockNIDDatabase.find(r => r.nidNumber === nidNumber);
  
  // No record found
  if (!record) {
    return {
      isValid: false,
      message: "NID number not found in the database."
    };
  }
  
  // Record exists but is inactive
  if (!record.isActive) {
    return {
      isValid: false,
      message: "NID is deactivated or suspended.",
      record
    };
  }
  
  // Verify that name matches
  if (record.fullName.toLowerCase() !== fullName.toLowerCase()) {
    return {
      isValid: false,
      message: "Name does not match NID records.",
      record
    };
  }
  
  // Verify that date of birth matches
  if (record.dateOfBirth !== dateOfBirth) {
    return {
      isValid: false,
      message: "Date of birth does not match NID records.",
      record
    };
  }
  
  // All verification passed
  return {
    isValid: true,
    message: "NID verification successful.",
    record
  };
}

// Mock NID verification API
export function setupNIDVerification(app: Express) {
  app.post("/api/verify/nid", async (req, res) => {
    const { nidNumber, fullName, dateOfBirth } = req.body;

    // Validate request
    if (!nidNumber || !fullName || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Basic format validation
    const isValidNIDFormat = /^\d{10,17}$/.test(nidNumber);
    const isValidName = fullName.length >= 3;
    const isValidDateOfBirth = !isNaN(Date.parse(dateOfBirth));

    if (!isValidNIDFormat || !isValidName || !isValidDateOfBirth) {
      let errorMessage = "Verification failed: ";
      
      if (!isValidNIDFormat) {
        errorMessage += "Invalid NID number format. ";
      }
      
      if (!isValidName) {
        errorMessage += "Invalid name format. ";
      }
      
      if (!isValidDateOfBirth) {
        errorMessage += "Invalid date of birth. ";
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage.trim()
      });
    }

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check against our mock database
    const validationResult = validateNIDRecord(nidNumber, fullName, dateOfBirth);

    if (validationResult.isValid) {
      return res.status(200).json({
        success: true,
        message: validationResult.message,
        verificationId: Math.random().toString(36).substring(2, 15)
      });
    } else {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }
  });

  // Mock passport verification API
  app.post("/api/verify/passport", async (req, res) => {
    const { passportNumber, fullName, dateOfBirth } = req.body;

    // Validate request
    if (!passportNumber || !fullName || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate verification process (mock)
    // In a real implementation, this would call the Bangladesh passport verification API
    // For demonstration, we'll consider a passport valid if:
    // - Passport number is 7-9 characters with letters and numbers
    // - Full name is at least 3 characters
    // - Date of birth is a valid date
    const isValidPassport = /^[A-Za-z0-9]{7,9}$/.test(passportNumber);
    const isValidName = fullName.length >= 3;
    const isValidDateOfBirth = !isNaN(Date.parse(dateOfBirth));

    if (isValidPassport && isValidName && isValidDateOfBirth) {
      return res.status(200).json({
        success: true,
        message: "Passport verification successful",
        verificationId: Math.random().toString(36).substring(2, 15)
      });
    } else {
      let errorMessage = "Verification failed: ";
      
      if (!isValidPassport) {
        errorMessage += "Invalid passport number format. ";
      }
      
      if (!isValidName) {
        errorMessage += "Invalid name format. ";
      }
      
      if (!isValidDateOfBirth) {
        errorMessage += "Invalid date of birth. ";
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage.trim()
      });
    }
  });
}
