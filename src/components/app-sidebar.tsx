// "use client"

import * as React from "react"

import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Stock } from '@/lib/model';

// This is sample data.
const data = {
  versions: ["1.0.0"],
  navMain: [
    {
      title: "Ticker symbols",
      url: "#",
      items: [
        {
          title: "AAPL",
          url: "/application/aapl",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
  ],
}

interface AppSidebarProps {
  stocks: Stock[];
  symbol: string;
}

export function AppSidebar({ stocks, symbol }: AppSidebarProps) {

  return (
    <Sidebar>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
            <SidebarGroup key="stock symbol">
              <SidebarGroupLabel>stock symbol</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {stocks.map((stock) => (
                    <React.Fragment key={stock.symbol}>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className={`block px-4 py-2 rounded-md ${stock.symbol === symbol ? 'font-bold bg-green-500' : ''} hover:bg-green-500`}>
                          <a href={`/dashboard/${stock.symbol}`}>
                            {stock.name} ({stock.symbol})
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </React.Fragment>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>


      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
