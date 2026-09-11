import { BottomNavigation } from "../../components/BottomNavigation";
import { ScreenLayout } from "../../components/ScreenLayout";
import type { CameraPermissionState } from "../scanning/ScannerSessionScreen";

interface SettingsScreenProps {
  cameraPermission: CameraPermissionState;
  onHome: () => void;
  onInventory: () => void;
  onScan: () => void;
  onResetCameraPermission: () => void;
}

const permissionLabel = (permission: CameraPermissionState) => {
  if (permission === "granted") return "Enabled";
  if (permission === "denied") return "Off";
  return "Not asked";
};

export function SettingsScreen({
  cameraPermission,
  onHome,
  onInventory,
  onScan,
  onResetCameraPermission,
}: SettingsScreenProps) {
  return (
    <ScreenLayout className="settings-screen" title="Settings" intro="Prototype preferences and storage details.">
      <section className="settings-list" aria-label="Current prototype settings">
        <div className="setting-row">
          <div>
            <strong>Expiration reminders</strong>
            <span>Visible inside the inventory</span>
          </div>
          <span className="setting-value">In-app</span>
        </div>
        <div className="setting-row">
          <div>
            <strong>Recognition</strong>
            <span>Uses test scenarios instead of a real model</span>
          </div>
          <span className="setting-value">Simulated</span>
        </div>
        <div className="setting-row">
          <div>
            <strong>Inventory storage</strong>
            <span>Saved only in this browser</span>
          </div>
          <span className="setting-value">On device</span>
        </div>
        <div className="setting-row">
          <div>
            <strong>Camera access</strong>
            <span>Controls the first-use scanner experience</span>
          </div>
          <span className="setting-value">{permissionLabel(cameraPermission)}</span>
        </div>
      </section>

      <div className="placeholder-note">
        <strong>Camera permission demo</strong>
        <p>Reset access to test the first-time explanation again.</p>
        <button className="secondary-button" type="button" onClick={onResetCameraPermission}>
          Reset camera permission
        </button>
      </div>

      <BottomNavigation
        activeSection="settings"
        onHome={onHome}
        onInventory={onInventory}
        onScan={onScan}
        onSettings={() => undefined}
      />
    </ScreenLayout>
  );
}
