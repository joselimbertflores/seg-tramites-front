import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chat-history',
  imports: [],
  templateUrl: './chat-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatHistoryComponent { }
