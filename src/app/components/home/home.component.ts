import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { HttpClient } from "@angular/common/http";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  data:any;
  constructor(private viewportScroller: ViewportScroller, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.loadScript("assets/js/jquery.min.js");
    this.loadScript("assets/js/gallery.js");
    this.httpClient.get<any>("assets/data/data.json").subscribe((data)=>
    this.data = data
  )
  }

  public onClick(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  public loadScript(url) {
    let node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(node);
  }
}
