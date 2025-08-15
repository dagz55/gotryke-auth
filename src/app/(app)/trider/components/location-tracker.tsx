"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, AlertCircle, CheckCircle } from "lucide-react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationTrackerProps {
  isOnline: boolean;
  onLocationUpdate?: (location: LocationData) => void;
}

export function LocationTracker({ isOnline, onLocationUpdate }: LocationTrackerProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const getLocationError = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access denied by user";
      case error.POSITION_UNAVAILABLE:
        return "Location information unavailable";
      case error.TIMEOUT:
        return "Location request timeout";
      default:
        return "An unknown error occurred";
    }
  };

  const updateLocation = useCallback((position: GeolocationPosition) => {
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };

    setLocation(locationData);
    setError(null);
    onLocationUpdate?.(locationData);
  }, [onLocationUpdate]);

  const checkPermission = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(permission.state);
      
      permission.addEventListener('change', () => {
        setPermissionStatus(permission.state);
      });
    } catch (err) {
      console.warn('Could not query permission status');
    }
  };

  const requestPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionStatus('granted');
        updateLocation(position);
      },
      (error) => {
        setPermissionStatus('denied');
        setError(getLocationError(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const startTracking = useCallback(() => {
    if (!navigator.geolocation || permissionStatus !== 'granted') return;

    setIsTracking(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position);
      },
      (error) => {
        setError(getLocationError(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );

    // Store watch ID for cleanup
    (window as any).locationWatchId = watchId;
  }, [permissionStatus, updateLocation]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if ((window as any).locationWatchId) {
      navigator.geolocation.clearWatch((window as any).locationWatchId);
      delete (window as any).locationWatchId;
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (isOnline && permissionStatus === 'granted') {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isOnline, permissionStatus, startTracking, stopTracking]);


  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  const getAccuracyStatus = (accuracy: number) => {
    if (accuracy <= 10) return { status: 'excellent', color: 'bg-green-500', text: 'Excellent' };
    if (accuracy <= 50) return { status: 'good', color: 'bg-blue-500', text: 'Good' };
    if (accuracy <= 100) return { status: 'fair', color: 'bg-yellow-500', text: 'Fair' };
    return { status: 'poor', color: 'bg-red-500', text: 'Poor' };
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Location Tracker</span>
          </div>
          <div className="flex items-center space-x-2">
            {isTracking && (
              <Badge variant="default" className="bg-green-500">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                Live
              </Badge>
            )}
            {permissionStatus === 'granted' && location && (
              <Badge 
                variant="secondary" 
                className={`${getAccuracyStatus(location.accuracy).color} text-white`}
              >
                {getAccuracyStatus(location.accuracy).text}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionStatus === 'prompt' && (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="font-medium mb-2">Location Permission Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To receive ride requests, we need access to your location
            </p>
            <Button onClick={requestPermission}>
              <MapPin className="h-4 w-4 mr-2" />
              Enable Location
            </Button>
          </div>
        )}

        {permissionStatus === 'denied' && (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="font-medium mb-2">Location Access Denied</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please enable location in your browser settings to go online
            </p>
            <Button variant="outline" onClick={checkPermission}>
              Check Again
            </Button>
          </div>
        )}

        {permissionStatus === 'granted' && location && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Latitude:</span>
                  <span className="font-mono">{formatCoordinate(location.latitude)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Longitude:</span>
                  <span className="font-mono">{formatCoordinate(location.longitude)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span>±{Math.round(location.accuracy)}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Update:</span>
                  <span>{new Date(location.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Location tracking active</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {!isOnline && permissionStatus === 'granted' && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Location tracking paused while offline
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}