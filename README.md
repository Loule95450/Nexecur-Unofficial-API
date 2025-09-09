# Nexecur Unofficial API

![GitHub release](https://img.shields.io/github/release/Loule95450/Nexecur-Unofficial-API.svg)
![GitHub repo size in bytes](https://img.shields.io/github/repo-size/Loule95450/Nexecur-Unofficial-API.svg)
![GitHub](https://img.shields.io/github/license/Loule95450/Nexecur-Unofficial-API.svg)

A modern, fully-typed TypeScript API for interacting with the Nexecur alarm system. This is an unofficial API that provides a clean, well-documented interface for controlling and monitoring your Nexecur security system.

This project is a complete refactor and modernization of the original codebase of [Baudev](https://github.com/Baudev), featuring improved code structure, comprehensive testing, and robust error handling.

## Installation

```bash
git clone https://github.com/Loule95450/Nexecur-Unofficial-API.git
cd Nexecur-Unofficial-API
npm install
npm run build
```

## Configuration

Configure the `config.json` file with your Nexecur credentials:

```json
{
  "token": "",
  "id_site": "your-site-id",
  "password": "your-password", 
  "id_device": "",
  "pin": "your-pin",
  "deviceName": "My API Device"
}
```

**Required fields:**
- `id_site`: Your site identification number (also called wiring code)
- `password`: Your account password (also called PIN)

**Optional fields:**
- `deviceName`: Display name for this API client in the system logs

The `token` and `id_device` fields are automatically populated during device registration.

## Usage

### Basic Example

```typescript
import { NexecurAPI, AlarmStatus } from 'nexecur-api';

async function main() {
  try {
    // Get current alarm status
    const status = await NexecurAPI.getAlarmStatus();
    console.log(`Alarm is currently: ${status === AlarmStatus.Enabled ? 'Armed' : 'Disarmed'}`);
    
    // Enable the alarm
    await NexecurAPI.enableAlarm();
    console.log('Alarm has been armed');
    
    // Get event history
    const events = await NexecurAPI.getEventHistory();
    console.log(`Found ${events.length} recent events`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

### Advanced Usage with Error Handling

```typescript
import { 
  NexecurAPI, 
  AlarmStatus, 
  OrderAlarmError, 
  UndefinedApiError,
  NexecurError 
} from 'nexecur-api';

async function controlAlarm() {
  try {
    const currentStatus = await NexecurAPI.getAlarmStatus();
    
    if (currentStatus === AlarmStatus.Disabled) {
      console.log('Arming alarm system...');
      await NexecurAPI.enableAlarm();
      console.log('✅ Alarm system armed successfully');
    } else {
      console.log('Disarming alarm system...');
      await NexecurAPI.disableAlarm();
      console.log('✅ Alarm system disarmed successfully');
    }
    
  } catch (error) {
    if (error instanceof OrderAlarmError) {
      console.error('🚨 Failed to control alarm:', error.message);
    } else if (error instanceof UndefinedApiError) {
      console.error('🌐 API communication error:', error.message);
    } else if (error instanceof NexecurError) {
      console.error(`🔧 Nexecur error [${error.code}]:`, error.message);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}
```

### Using Custom Configuration

```typescript
import { NexecurAPI, UserConfiguration, NexecurConfiguration } from 'nexecur-api';

// Use a custom configuration file location
NexecurConfiguration.setConfigFilePath('./my-custom-config.json');

// Or set configuration programmatically
const customConfig = new UserConfiguration({
  idSite: 'your-site-id',
  password: 'your-password',
  deviceName: 'Custom Device Name'
});

NexecurAPI.setUserConfiguration(customConfig);
```

## API Reference

### Main API Methods

#### `NexecurAPI.getAlarmStatus(): Promise<AlarmStatus>`
Returns the current status of the alarm system.

#### `NexecurAPI.enableAlarm(): Promise<void>`
Arms the alarm system. Waits for confirmation that the operation completed.

#### `NexecurAPI.disableAlarm(): Promise<void>`
Disarms the alarm system. Waits for confirmation that the operation completed.

#### `NexecurAPI.getEventHistory(): Promise<IEvenement[]>`
Retrieves the recent event history from the alarm system.

#### `NexecurAPI.getStream(deviceSerial: string): Promise<IStreamResponse>`
Requests stream (camera) data for a device identified by its `serial` field as returned in `devices` from the site payload.

### Types and Enums

#### `AlarmStatus`
```typescript
enum AlarmStatus {
  Disabled = 0,  // Alarm is disarmed
  Enabled = 1    // Alarm is armed
}
```

#### `UserConfiguration`
```typescript
interface IUserConfiguration {
  token: string;
  idSite: string;
  password: string;
  idDevice: string;
  pin: string;
  deviceName: string;
}
```

### Error Types

All errors extend the base `NexecurError` class and include:
- `SaltGenerationError`: Salt generation failed
- `TokenGenerationError`: Authentication token generation failed
- `RegisteringDeviceError`: Device registration failed
- `OrderAlarmError`: Alarm control operation failed
- `UndefinedApiError`: General API communication error
- `StillPendingError`: Operation timeout (took too long to complete)

## Development

### Building the Project

```bash
npm run build          # Build TypeScript to JavaScript
npm run build:watch    # Build with file watching
npm run clean          # Clean build artifacts
```

### Running Tests

```bash
npm test               # Run all tests
npm run test:watch     # Run tests with file watching
```

### Project Structure

```
src/
├── controllers/       # Main API classes
├── models/           # Data models and configuration
├── helpers/          # Utility functions
├── interfaces/       # TypeScript interfaces
└── index.ts          # Main entry point

tests/                # Test files
├── *.test.ts         # Unit tests for individual components
└── tests.ts          # Integration tests

dist/                 # Compiled JavaScript output
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Build the project: `npm run build`
6. Commit your changes: `git commit -am 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

## License

MIT License

Copyright (c) 2025 Loule95450.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Legal Disclaimer

This code is in no way affiliated with, authorized, maintained, sponsored or endorsed by Nexecur or any of its affiliates or subsidiaries. This is an independent and unofficial API. Use at your own risk.
