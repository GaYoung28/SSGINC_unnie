package com.ssginc.unnie.shop.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ShopViewController {

    @GetMapping("/shop-map")
    public String getShopMapPage() {
        return "map/map";
    }

    @GetMapping("/shopdetail")
    public String getShopdetailPage() {
        return "map/shopdetail";
}
}
