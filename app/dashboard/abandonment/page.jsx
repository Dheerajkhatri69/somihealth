"use client";

import React, { useEffect, useState } from "react";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

// ShadCN chart config
const chartConfig = {
    desktop: {
        label: "Last Segment",
        color: "#2c3a57",
    },
};

const ChartAreaInteractive = () => {
    const [chartData, setChartData] = useState([]);
    const [timeRange, setTimeRange] = useState("90d");

    useEffect(() => {
        async function fetchData() {
            const res = await fetch("/api/abandoned");
            const { result } = await res.json();

            const transformed = result.map((item) => ({
                date: item.updatedAt.split("T")[0],
                desktop: item.lastSegmentReached,
                email: item.firstSegment?.email || "",
                name: item.firstSegment?.firstName + " " + item.firstSegment?.lastName || "",
                phone: item.firstSegment?.phone || "",
            }));

            setChartData(transformed);
        }

        fetchData();
    }, []);

    const filteredData = chartData.filter((item) => {
        const itemDate = new Date(item.date);
        const reference = new Date();
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

        const startDate = new Date(reference);
        startDate.setDate(reference.getDate() - days);

        return itemDate >= startDate;
    });

    return (
        <Card className="m-2">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Area Chart - Interactive</CardTitle>
                    <CardDescription>
                        Showing last segment reached per user (last {timeRange})
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="hidden w-[160px] sm:flex">
                        <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="90d">Last 3 months</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#2c3a57"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#2c3a57"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        {/* <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                        
                                    }
                                    indicator="dot"
                                />
                            }
                        /> */}
                        <ChartTooltip
                            content={({ active, payload }) =>
                                active && payload?.length ? (
                                    <div className="bg-white p-2 border rounded-lg shadow">
                                        <p>Name: {payload[0].payload.name}</p>
                                        <p>Email: {payload[0].payload.email}</p>
                                        <p>Last Segment: {payload[0].value}</p>
                                    </div>
                                ) : null
                            }
                        />

                        <Area
                            dataKey="desktop"
                            type="natural"
                            fill="url(#fillDesktop)"
                            stroke="#2c3a57"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {filteredData.map((user, index) => (
                    <Card key={index} className="border-2 border-l-4 duration-200 hover:border-l-8  border-secondary">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-secondary-foreground">
                                Full name: {user.name || "N/A"}
                                <br />
                                {user.email || "Unknown User"}
                            </CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                                Last Segment: {user.desktop}
                                <br />
                                Phone: {user.phone || "N/A"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Date: {new Date(user.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </CardContent>
                    </Card>
                ))}
            </CardContent>

        </Card>
    );
};

export default ChartAreaInteractive;
