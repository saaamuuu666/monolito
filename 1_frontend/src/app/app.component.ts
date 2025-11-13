import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestApiServiceService } from './services/rest-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'frontend';
  posts: any[] = [];

  constructor(private api: RestApiServiceService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.api.getPosts().subscribe((data) => {
      this.posts = data;
    });
  }
}