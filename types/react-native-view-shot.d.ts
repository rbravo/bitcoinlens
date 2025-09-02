declare module 'react-native-view-shot' {
  import * as React from 'react';
    import { ViewProps } from 'react-native';

  interface CaptureOptions {
    format?: 'jpg' | 'png' | 'webm';
    quality?: number; // 0..1
    result?: 'tmpfile' | 'base64' | 'data-uri';
    snapshotContentContainer?: boolean;
  }

  export interface ViewShotRef {
    capture: (options?: CaptureOptions) => Promise<string>;
  }

  interface ViewShotProps extends ViewProps {
    children?: React.ReactNode;
    options?: CaptureOptions;
    onCapture?: (uri: string) => void;
    captureMode?: 'mount' | 'continuous' | 'update';
    style?: any;
  }

  const ViewShot: React.ForwardRefExoticComponent<React.PropsWithoutRef<ViewShotProps> & React.RefAttributes<ViewShotRef>>;
  export default ViewShot;
}
