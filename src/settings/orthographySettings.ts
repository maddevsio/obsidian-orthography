import type OrthographyPlugin from '../main';

interface SettingsData {
  displayRunner: boolean;
  language: string;
}

function getDefaultData(): SettingsData {
  return {
    displayRunner: true,
    language: 'en, ru, uk'
  };
}

export class OrthographySettings {
  private data: SettingsData;
  private emitter: any;

  constructor(private plugin: OrthographyPlugin, emitter: any) {
    this.data = getDefaultData();
    this.emitter = emitter;
  }

  get displayRunner(): boolean {
    const { data } = this;
    return data.displayRunner;
  }

  set displayRunner(value: boolean) {
    const { data } = this;
    data.displayRunner = value;
    this.emitter.dispatch('onUpdateSettings', this.data);
  }

  get language(): string {
    const { data } = this;
    return data.language;
  }

  set language(value: string) {
    const { data } = this;
    data.language = value;
    this.emitter.dispatch('onUpdateSettings', this.data);
  }

  async loadSettings(): Promise<void> {
    const { plugin } = this;
    this.data = Object.assign(getDefaultData(), await plugin.loadData());
  }

  async saveSettings(): Promise<void> {
    const { plugin, data } = this;
    if (plugin && data) {
      await plugin.saveData(data);
    }
  }
}
