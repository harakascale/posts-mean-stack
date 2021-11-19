import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Post } from "./post.model";
import { map } from 'rxjs/operators';
import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";



@Injectable({providedIn:"root"})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts:Post[], postCount: number}>();

  constructor(private httpClient: HttpClient, private router: Router) {  }

  getPost(postsPerPage: number, currentPage: number){
    // return [...this.posts];
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`
    this.httpClient
    .get<{message:string, posts:any, maxPosts: number}>(
      'http://localhost:3000/api/posts'+ queryParams
      )
      .pipe(map((postData) =>{
          return {posts: postData.posts.map(post =>{
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }), maxPosts: postData.maxPosts };
      })
      )
      .subscribe(transformedPostsData => {
        this.posts = transformedPostsData.posts;
        this.postsUpdated.next({
         posts: [...this.posts],
         postCount: transformedPostsData.maxPosts})
      });
  }

  getPostUpdateListener(){
    return this.postsUpdated.asObservable();
  }

  receivePost(id: string){
    return this.httpClient.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      creator: string,
    }>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title:string, content: string, image: File){
    // const post: Post ={id:null,title: title, content: content};
    const postData = new FormData();
    postData.append('title', title);
    postData.append("content", content);
    postData.append("image", image, title );
    this.httpClient.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
    .subscribe((responseData) =>{
      // const post: Post = {
      //   id: responseData.post.id,
      //   title: title,
      //   content: content,
      //   imagePath: responseData.post.imagePath
      // };
      // // const id = responseData.postId;
      // // post.id = id;
      // this.posts.push(post);
      // this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    });
  }

  updatePost(id: string, title: string, content: string, image: File | string){
    // const post: Post = {id:id, title: title, content: content, imagePath: null};
    let postData: Post | FormData;
    if(typeof image === 'object') {
        postData = new FormData();
        postData.append("id", id);
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title);
    } else {
      postData = {
          id: id,
          title:title,
          content: content,
          imagePath: image,
          creator: null
        };
    }

    this.httpClient.put('http://localhost:3000/api/posts/' + id, postData)
    .subscribe(response => {
      this.router.navigate(["/"]);
    });
  }

  deletePost(postId: string) {
    return this.httpClient.delete("http://localhost:3000/api/posts/" + postId);
  }
}
