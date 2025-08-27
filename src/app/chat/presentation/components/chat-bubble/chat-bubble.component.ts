import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../../auth/presentation/services/auth.service';
import { MessageStatusComponent } from '../message-status/message-status.component';
import { Message } from '../../../domain';
import { SecureImageViewerComponent } from '../../../../shared';

@Component({
  selector: 'chat-bubble',
  imports: [CommonModule, MessageStatusComponent, SecureImageViewerComponent],
  template: `
    @if(message().sender.id === userId){
      <div class="flex justify-end mb-2">
        <div class="rounded-lg py-2 px-4 min-w-[100px] bubble bubble-right" >
          
          @switch (message().type) {
            @case ("text") {
               <p class="text-sm mt-1">{{ message().content }}</p>
            }
          
            @case ("media") {
              @switch (message().media?.type) {
                @case ("image") {
                  <div  class="max-w-[200px] rounded-lg">
                    <secure-image-viewer [imageUrl]="message().media!.fileName"/>
                  </div>
                }
                @case ("video") {
                }
                @case ("audio") {
                }
                @default {
                  <a [href]="message().media?.fileName" 
                    download="{{message().media?.originalName}}" 
                    class="text-blue-500 underline">
                    {{ message().media?.originalName }}
                  </a>
                }
              }

            }
            @default {
              <p>{{message()|json}}</p>
            }
          }

          <p class="text-right text-xs text-grey-dark mt-1 flex items-center justify-end">
            {{ message().sentAt | date : 'shortTime' }}
            <span class="ml-1 flex items-center">
              <message-status [isRead]="message().isRead"/>
            </span>
          </p>
        </div>
      </div>
    } 
    @else {
      <div class="flex mb-2">
        <div class="rounded-lg py-2 px-4 min-w-[100px] bubble bubble-left">
          <p class="text-sm mt-1">
            {{ message().content }}
          </p>
          <p class="text-right text-xs text-grey-dark mt-1">
            {{ message().sentAt | date : 'shortTime' }}
          </p>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles:`
    @use '@angular/material' as mat;
    .bubble {
      @include mat.theme((
        color: mat.$green-palette,
      ));
    }
    .bubble-right {
      background-color: var(--mat-sys-secondary-container);
    }
    .bubble-left {
      background-color: var(--mat-sys-surface-container-high);
    }
  `
})
export class ChatBubbleComponent {
  userId = inject(AuthService).user()?.userId;
  message = input.required<Message>();
}
