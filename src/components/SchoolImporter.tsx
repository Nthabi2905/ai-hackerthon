import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { parseSchoolRow } from "@/utils/parseSchoolData";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const GOOGLE_API_KEY = "AIzaSyDGXq7rXxJ9FqY8VNqX_XR9w8hZ7KxXYZE"; // Publishable key for Google Drive
const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com"; // You'll need to add this

const SchoolImporter = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  useEffect(() => {
    // Load Google API
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.onload = () => {
      window.gapi.load('client:picker', () => {
        setIsGoogleReady(true);
      });
    };
    
    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    
    document.body.appendChild(script1);
    document.body.appendChild(script2);
    
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  const handleGoogleDrivePicker = async () => {
    if (!isGoogleReady) {
      toast.error("Google Drive is loading, please try again");
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: async (response: any) => {
          if (response.access_token) {
            await showPicker(response.access_token);
          }
        },
      });
      
      tokenClient.requestAccessToken();
    } catch (error: any) {
      console.error('Google Drive picker error:', error);
      toast.error("Failed to open Google Drive picker");
    }
  };

  const showPicker = async (accessToken: string) => {
    await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
    
    const picker = new window.google.picker.PickerBuilder()
      .addView(
        new window.google.picker.DocsView()
          .setIncludeFolders(true)
          .setMimeTypes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel')
      )
      .setOAuthToken(accessToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(async (data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          await processGoogleDriveFiles(data.docs, accessToken);
        }
      })
      .setTitle('Select Excel files')
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .build();
    
    picker.setVisible(true);
  };

  const processGoogleDriveFiles = async (files: any[], accessToken: string) => {
    setIsImporting(true);
    let totalImported = 0;

    try {
      for (const file of files) {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const schools = jsonData
          .map(parseSchoolRow)
          .filter(school => school !== null);

        if (schools.length === 0) {
          toast.error(`No valid schools found in ${file.name}`);
          continue;
        }

        const { error } = await supabase.functions.invoke('import-schools', {
          body: { schools }
        });

        if (error) throw error;

        totalImported += schools.length;
        toast.success(`Imported ${schools.length} schools from ${file.name}`);
      }

      toast.success(`Successfully imported ${totalImported} schools from Google Drive!`);
    } catch (error: any) {
      console.error('Google Drive import error:', error);
      toast.error(error.message || "Failed to import from Google Drive");
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    let totalImported = 0;

    try {
      for (const file of Array.from(files)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const schools = jsonData
          .map(parseSchoolRow)
          .filter(school => school !== null);

        if (schools.length === 0) {
          toast.error(`No valid schools found in ${file.name}`);
          continue;
        }

        // Call the import edge function
        const { data: result, error } = await supabase.functions.invoke('import-schools', {
          body: { schools }
        });

        if (error) throw error;

        totalImported += schools.length;
        toast.success(`Imported ${schools.length} schools from ${file.name}`);
      }

      toast.success(`Successfully imported ${totalImported} schools total!`);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || "Failed to import schools");
    } finally {
      setIsImporting(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Import Schools Data</CardTitle>
        <CardDescription>
          Upload Excel files containing school data to import into the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleGoogleDrivePicker}
            disabled={isImporting || !isGoogleReady}
            variant="outline"
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
            {isGoogleReady ? 'Import from Google Drive' : 'Loading Google Drive...'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or upload files
              </span>
            </div>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Select one or more Excel files to import
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              multiple
              onChange={handleFileUpload}
              disabled={isImporting}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={isImporting}>
                <span>
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Select Files
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolImporter;
