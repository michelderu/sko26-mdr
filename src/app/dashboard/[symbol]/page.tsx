import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DataTable } from '@/components/data-table';
import { columns } from "@/components/columns"
import { getStocksFromAstra, getTradesFromAstra, Stock, Trade } from '@/lib/model';
import { Separator } from '@radix-ui/react-separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

type Params = Promise<{ symbol: string }>;

/**
 * This is a server component for the stock main dashboard.
 * It resolves selected stockSymbol from the url and fetches trades data from AstraDB, then renders the dashboard.
 * 
 * Param stockSymbol is passed from the url acting as dynamic routing. 
 * More info on dynamic routing can be found here: https://beta.nextjs.org/docs/routing/dynamic-routes
 * 
 */
export default async function Dashboard({params}: {params: Params}) {
  const {symbol} = await params;

  // read stocks and trades data from AstraDB
  const stocks : Stock[] =  await getStocksFromAstra();
  let trades : Trade[] = [];
  if(symbol !== "default") {
    trades = await getTradesFromAstra(symbol);
  }

  // dashboard component consists of 3 parts:
  // 1. Sidebar, which is a list of stock can be selected.
  // 2. Breadcrumb, which shows the current selected stock.
  // 3. DataTable, which shows the trades data of the selected stock.
  return (
    <SidebarProvider>
        <AppSidebar stocks={stocks} symbol={symbol}/>
        <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                    Stock symbol
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                    <BreadcrumbPage>{symbol}</BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            </header>
                <div className="flex flex-1 flex-col gap-4 p-10">
                    <DataTable columns={columns} data={trades} />
                </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
