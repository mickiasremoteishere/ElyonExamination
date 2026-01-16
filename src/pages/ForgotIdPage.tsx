import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase'; // Adjust the import path as needed

const ForgotIdPage = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+251 ');
  const [isLoading, setIsLoading] = useState(false);
  const [admissionId, setAdmissionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAdmissionId(null);
    
    try {
      // First, let's check if we can find any matching records
      const { data: allData, error: queryError } = await supabase
        .from('students_1')
        .select('*')
        .ilike('full_name', `%${fullName}%`);
      
      console.log('All matching name records:', JSON.stringify(allData, null, 2));
      
      if (queryError) {
        console.error('Query error:', queryError);
        throw queryError;
      }
      
      if (!allData || allData.length === 0) {
        throw new Error('No records found matching the provided name.');
      }

      // Convert phone numbers to a consistent format for comparison
      const normalizePhone = (phone: string | number | null | undefined): string => {
        if (!phone) return '';
        
        // Convert to string and remove all non-digit characters
        let digits = String(phone).replace(/\D/g, '');
        
        // If number starts with country code (251), ensure full international format
        if (digits.startsWith('251') && digits.length === 12) {
          return digits; // Already in international format
        }
        
        // If number starts with 0 and has 10 digits, convert to international format
        if (digits.startsWith('0') && digits.length === 10) {
          return '251' + digits.slice(1);
        }
        
        // If number has 9 digits, assume it's a local number and add country code
        if (digits.length === 9) {
          return '251' + digits;
        }
        
        return digits;
      };
      
      // Function to compare two phone numbers with flexible formatting
      const comparePhones = (inputPhone: string, dbPhone: string | number): boolean => {
        // Convert both to strings and remove all non-digit characters
        let cleanInput = String(inputPhone).replace(/\D/g, '');
        let cleanDb = String(dbPhone).replace(/\D/g, '');
        
        // If the database phone starts with 251, ensure we're comparing the same format
        if (cleanDb.startsWith('251') && cleanInput.startsWith('0')) {
          cleanInput = '251' + cleanInput.slice(1);
        } else if (cleanDb.startsWith('251') && cleanInput.length === 9) {
          cleanInput = '251' + cleanInput;
        } else if (cleanDb.startsWith('0') && cleanInput.startsWith('251')) {
          cleanDb = '0' + cleanDb.slice(3);
        }
        
        // Log the cleaning process for debugging
        console.log('Phone comparison:', {
          input: phoneNumber,
          db: dbPhone,
          cleanInput,
          cleanDb,
          last9Input: cleanInput.slice(-9),
          last9Db: cleanDb.slice(-9)
        });
        
        // Compare the full numbers
        if (cleanInput === cleanDb) {
          return true;
        }
        
        // Compare the last 9 digits (without country code)
        if (cleanInput.slice(-9) === cleanDb.slice(-9)) {
          return true;
        }
        
        // Try comparing with and without country code
        if (cleanInput.endsWith(cleanDb) || cleanDb.endsWith(cleanInput)) {
          return true;
        }
        
        // As a last resort, check if one is a substring of the other (ignoring country code)
        const inputLast9 = cleanInput.slice(-9);
        const dbLast9 = cleanDb.slice(-9);
        return inputLast9 === dbLast9;
      };

      // Log all phone numbers for debugging
      console.log('Available phone numbers in matching records:', 
        allData.map((s: any) => ({
          name: s.full_name, 
          phone: s.phone,
          normalized: normalizePhone(s.phone)
        }))
      );
      
      // Try to find a match with flexible phone number comparison
      const exactMatch = allData.find((student: any) => {
        const studentPhone = student.phone;
        console.log('--- Starting phone comparison ---');
        console.log('Input phone:', phoneNumber);
        console.log('DB phone:', studentPhone);
        
        try {
          const isMatch = comparePhones(phoneNumber, studentPhone);
          console.log('Comparison result:', isMatch);
          return isMatch;
        } catch (error) {
          console.error('Error comparing phones:', error);
          return false;
        }
      });

      console.log('Exact match found:', exactMatch ? {
        name: exactMatch.full_name,
        phone: exactMatch.phone,
        admission_id: exactMatch.admission_id
      } : 'No exact match found');

      if (exactMatch) {
        console.log('Found exact match:', exactMatch);
        setAdmissionId(exactMatch.admission_id);
        return;
      }
      
      // If no direct match, try a more lenient search
      console.log('No exact match found, trying lenient search...');
      
      // First, try to find by name and last 9 digits of phone number
      const lastNineDigits = phoneNumber.replace(/\D/g, '').slice(-9);
      const normalizedName = fullName.trim().toUpperCase();
      
      console.log('Trying to find by name and last 9 digits of phone...');
      const { data: namePhoneMatch, error: namePhoneError } = await supabase
        .from('students_1')
        .select('admission_id, full_name, phone')
        .ilike('full_name', `%${normalizedName}%`)
        .or(`phone.ilike.%${lastNineDigits}`)
        .maybeSingle();
        
      if (namePhoneMatch && !namePhoneError) {
        console.log('Found match by name and last 9 digits of phone:', namePhoneMatch);
        setAdmissionId(namePhoneMatch.admission_id);
        return;
      }
      
      // If still no match, try with different phone number formats
      console.log('Trying different phone number formats...');
      
      // Clean the input number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      // Try different formats
      const phoneVariations = [
        cleanPhone,                       // 0901497017
        cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone, // 901497017
        cleanPhone.startsWith('251') ? cleanPhone : '251' + (cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone), // 251901497017
        '0' + (cleanPhone.startsWith('251') ? cleanPhone.slice(3) : cleanPhone) // 0901497017 (with leading 0)
      ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
      
      // Try each variation one by one
      for (const phone of phoneVariations) {
        console.log(`Trying phone: ${phone}`);
        const { data, error } = await supabase
          .from('students_1')
          .select('admission_id, full_name, phone')
          .or(`and(full_name.ilike.%${normalizedName}%,phone.eq.${phone})`)
          .maybeSingle();
          
        if (data && !error) {
          console.log('Found match with phone variation:', phone, data);
          setAdmissionId(data.admission_id);
          return;
        }
      }
      
    } catch (error) {
      console.error('Error details:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error,
        fullName,
        phoneNumber,
        time: new Date().toISOString()
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No matching record found. Please check your details and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="bg-card border border-border rounded-2xl shadow-elevated p-8 animate-scale-in">
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Login
            </Link>
            
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Mail size={24} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {admissionId ? 'Your Admission ID' : 'Recover Your Admission ID'}
            </h1>
            <p className="text-muted-foreground">
              {admissionId 
                ? 'Here is your Admission ID. Please keep it safe!'
                : 'Please provide your full name and phone number to recover your Admission ID.'}
            </p>
          </div>

          {admissionId ? (
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="text-3xl font-bold text-primary">{admissionId}</div>
                <button
                  onClick={() => copyToClipboard(admissionId || '')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-muted-foreground">+251</span>
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber.replace(/^\+251\s?/, '')}
                    onChange={(e) => {
                      // Remove any non-digit characters and limit to 9 digits
                      let value = e.target.value.replace(/\D/g, '').slice(0, 9);
                      // Format as +251 XX XXX XXXX
                      if (value.length > 3) {
                        value = `${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5)}`;
                      } else if (value.length > 2) {
                        value = `${value.slice(0, 2)} ${value.slice(2)}`;
                      }
                      setPhoneNumber(`+251 ${value}`);
                    }}
                    placeholder="90 123 4567"
                    className="w-full pl-16 px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : 'Find My ID'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotIdPage;