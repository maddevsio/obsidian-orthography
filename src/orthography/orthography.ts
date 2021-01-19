import type { App } from 'obsidian';
import { OrthographySettings } from 'src/settings';
import { API_URL } from '../config';
import { HIGHLIGHT_CSS_CLASS } from './constants';

interface IOrthography {
  check(): void;
}

export class Orthography implements IOrthography {
  public app: App;
  public settings: OrthographySettings;
  private markers: any = [];

  constructor(app: App, settings: OrthographySettings) {
    this.app = app;
    this.settings = settings;
  }

  public check(): Promise<any> {
    return this.validateText();
  }

  public clear(): void {
    this.clearHighlightWords();
  }

  public getHintsFromServer(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const text = this.getEditorText();
        const formData = new FormData();
        formData.append('text', text);
        const hintsData = await this.postData(API_URL, formData);
        localStorage.setItem('obsidian-orthography', JSON.stringify(hintsData));
        resolve(hintsData);
      } catch (error) {
        reject(error);
      }
    });
  }

  private validateText() {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const hints = await this.getHintsFromServer();
        if (hints && hints.length) {
          const regex = this.createSearchQuery(hints);
          this.highlightWords(regex);
        }

        // Delay for button animation
        setTimeout(() => {
          resolve(hints);
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }

  private getEditorText() {
    const activeLeaf: any = this.app.workspace.activeLeaf;
    const editor = activeLeaf.view.sourceMode.cmEditor;
    return editor.getValue();
  }

  private highlightWords(regex: RegExp): void {
    const activeLeaf: any = this.app.workspace.activeLeaf;
    const editor = activeLeaf.view.sourceMode.cmEditor;
    const searchQuery = new RegExp(regex);
    const cursor = editor.getSearchCursor(searchQuery);
    while (cursor.findNext()) {
      const from = cursor.from();
      const to = cursor.to();
      this.markers.push(
        editor.markText(from, to, {
          className: HIGHLIGHT_CSS_CLASS,
          attributes: {
            'data-pos': from.line + '-' + from.ch
          }
        })
      );
    }
  }

  private clearHighlightWords() {
    const highlightWords = document.querySelectorAll('.' + HIGHLIGHT_CSS_CLASS);
    highlightWords.forEach((span) => {
      span.removeAttribute('class');
    });
    this.markers.forEach((marker: any) => marker.clear());
  }

  private createSearchQuery(list: []) {
    if (!list.length) return new RegExp(/^/gi);

    const words = list.map(function (item: any) {
      return item['word'];
    });
    const searchRequest = new RegExp(words.join('|'), 'gi');
    return searchRequest;
  }

  private async postData(url: string, formData: FormData) {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    return await response.json();
  }
}
