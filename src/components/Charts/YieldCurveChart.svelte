<script lang="ts">
  import * as d3 from 'd3';
  import { onMount, onDestroy } from 'svelte';
  import { bondData } from '../../lib/stores/bond.js';
  import { get } from 'svelte/store';
  import type { BondData } from '$lib/types.js';
  import Button from '../Button.svelte';

  let svg: SVGSVGElement;
  let container: HTMLDivElement;
  let zoombarSvg: SVGSVGElement;

  const margin = { top: 40, right: 20, bottom: 80, left: 80 };
  let width = 0;
  let height = 0;
  let selectedRange = 'current';
  let previousRange = '';
  let showComparison = false;
  let comparisonMode = ''; 

  
  let zoomState = {
    scale: 1,
    translate: [0, 0],
    domain: null as [Date, Date] | null,
  };

  // Variables for the zoom bar
  const zoombarHeight = 60;
  const zoombarMargin = { top: 10, right: 20, bottom: 20, left: 80 };
  let zoomSelection = { start: 0, end: 1 }; 

  let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;

  type Bond = {
    year: number;
    maturityDate: number;
    description: string;
    comments: string;
    code: string;
    value: number;
    period: string;
    amountIssued: number;
    duration: string;
    maturityType: string;
    issuedCurrency: string;
    __typename?: string;
    date?: Date;
    yield?: number;
    size?: number;
    historicalValues?: {
      threeMonths?: number;
      oneYear?: number;
      threeYears?: number;
    };
  };

  let availableRanges: string[] = [];

$: if ($bondData) {
  availableRanges = Object.keys($bondData)
    .filter((key) => key.startsWith('bonds_') && Array.isArray($bondData[key]))
    .map((key) => key.replace('bonds_', ''));
}
  function getRangeData(range: string, bondData: BondData): Bond[] {
    const key = `bonds_${range}`;
    const data = bondData[key];

    if (Array.isArray(data)) {
      return data;
    }

    return bondData.bonds_current ?? [];
  }

  let data: Bond[] = [];
  let originalXDomain: [Date, Date];

  function updateDataAndRedraw() {
    const dataStore = get(bondData);
    if (!dataStore) return;
    const currentData = getRangeData(selectedRange, dataStore).map((d: Bond) => ({
      ...d,
      date: new Date(d.maturityDate),
      yield: d.value,
      size: d.amountIssued,
    }));

    // If comparison is active, process historical data
    if (showComparison) {
      // Determine which historical dataset to use
      let historicalRangeKey = '';
      if (comparisonMode === '3M') {
        historicalRangeKey = 'bonds_3months_ago';
      } else if (comparisonMode === '1Y') {
        historicalRangeKey = 'bonds_1year_ago';
      } else if (comparisonMode === '3Y') {
        historicalRangeKey = 'bonds_3years_ago';
      }

      // Get historical data if available
      if ((bondData as any)[historicalRangeKey]) {
        const historicalData = (bondData as any)[historicalRangeKey];

        // Create a map to quickly find matching bonds by code
        const historicalMap = new Map();
        historicalData.forEach((bond: Bond) => {
          historicalMap.set(bond.code, bond.value);
        });

        // Add historical values to current data points if available
        currentData.forEach((bond) => {
          if (historicalMap.has(bond.code)) {
            bond.historicalValues = {
              ...bond.historicalValues,
              [comparisonMode === '3M'
                ? 'threeMonths'
                : comparisonMode === '1Y'
                  ? 'oneYear'
                  : 'threeYears']: historicalMap.get(bond.code),
            };
          }
        });
      }
    }

    data = currentData;
    drawChart();
    drawZoombar();
  }

  function generateTooltipHTML(bond: Bond): string {
    let historicalSection = '';

    if (showComparison && bond.historicalValues) {
      const historicalKey =
        comparisonMode === '3M'
          ? 'threeMonths'
          : comparisonMode === '1Y'
            ? 'oneYear'
            : 'threeYears';

      if (bond.historicalValues[historicalKey] !== undefined) {
        const historicalValue = bond.historicalValues[historicalKey];
        const difference = bond.yield! - historicalValue!;
        const diffColor = difference >= 0 ? '#ef4444' : '#10b981';
        const diffSign = difference >= 0 ? '+' : '';

        historicalSection = `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between;">
              <span>${comparisonMode} ago yield</span>
              <strong>${historicalValue?.toFixed(2)}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Change</span>
              <strong style="color: ${diffColor}">${diffSign}${difference.toFixed(2)}%</strong>
            </div>
          </div>
        `;
      }
    }

    return `
      <div style="display: flex; border-bottom: 1px solid #EDEDED; font-size: 12px; align-items: center; font-weight: 500; padding-bottom: 10px;">
         <span style="height: 12px; width: 12px; background: #5D43B1; margin: 0 10px 0 0px"></span> ${bond.description}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid #EDEDED;">
          <span>Yield to Convention (%)</span>
          <span>${bond.yield?.toFixed(2)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid #EDEDED;">
          <span>Maturity date</span>
          <span>${new Date(bond.maturityDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; border-bottom: 1px solid #EDEDED;">
          <span>Amount issued (mn)</span>
          <span>${(bond.size! / 1000000).toFixed(2)} USD</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; ">
          <span>Maturity type</span>
          <span>${bond.maturityType}</span>
        </div>
        ${historicalSection}
    `;
  }

  function drawVerticalConnectors(
    svgEl: d3.Selection<SVGGElement, unknown, null, undefined>,
    currentData: Bond[],
    historicalData: Bond[],
    x: d3.ScaleTime<number, number>,
    y: d3.ScaleLinear<number, number>,
  ) {
    const historicalMap = new Map(historicalData.map((d) => [d.code || d.description, d]));

    currentData.forEach((currentBond) => {
      const key = currentBond.code || currentBond.description;
      const pastBond = historicalMap.get(key);

      if (pastBond) {
        const cx = x(currentBond.date!);
        const y1 = y(currentBond.yield!) - 13;
        const y2 = y(pastBond.yield!) + 13;

        svgEl
          .append('line')
          .attr('x1', cx)
          .attr('x2', cx)
          .attr('y1', y1)
          .attr('y2', y2)
          .attr('stroke', '#D1D5DB') 
          .attr('stroke-width', 3);
      }
    });
  }

  function drawChart() {
    if (!container || !data.length) return;
    width = container.clientWidth-20;
    height = container.clientHeight || 500;

    d3.select(svg).selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xDomain = zoomState.domain || (d3.extent(data, (d) => d.date!) as [Date, Date]);

    const x = d3.scaleTime().domain(xDomain).range([0, innerWidth]);

    if (!originalXDomain) {
      originalXDomain = d3.extent(data, (d) => d.date!) as [Date, Date];
    }

    const y = d3
      .scaleLinear()
      .domain([Math.max(0, d3.min(data, (d) => d.yield!)! - 1), d3.max(data, (d) => d.yield!)! + 1])
      .range([innerHeight, 0]);

    const r = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.size)!])
      .range([4, 20]);

    const svgEl = d3
      .select(svg)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw grid
    svgEl
      .append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(8)
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      )
      .selectAll('line')
      .attr('stroke', '#eee'); 

    // Axes
    svgEl
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', '#404040') 
      .attr('text-anchor', 'middle')
      .text('Maturity date');

    svgEl.select('.grid').select('.domain').remove();
    svgEl.select('.domain').attr('stroke', '#DBDBDB');
 

    const yAxis = svgEl.append('g').call(d3.axisLeft(y));
    yAxis.selectAll('.grid .domain').remove();
    yAxis.select('path').attr('stroke', 'none');
    yAxis.selectAll('line').attr('stroke', 'none');

    yAxis
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .attr('fill', '#404040') 
      .attr('text-anchor', 'middle')
      .text('Yield to Convention (%)');

    // Draw historical dots if selectedRange ≠ current
    let historicalData: Bond[] = [];
    let visibleData: Bond[] = [];
    const dataStore = get(bondData);
    if (!dataStore) return;
    if (selectedRange !== 'current') {
      historicalData = getRangeData('current', dataStore)
        .map((d: Bond) => ({
          ...d,
          date: new Date(d.maturityDate),
          yield: d.value,
          size: d.amountIssued,
        }))
        .filter((d) => d.date! >= xDomain[0] && d.date! <= xDomain[1]);

      svgEl
        .selectAll('.circle-historical')
        .data(historicalData)
        .enter()
        .append('circle')
        .attr('class', 'circle-historical')
        .attr('cx', (d) => x(d.date!))
        .attr('cy', (d) => y(d.yield!))
        .attr('r', (d) => r(d.size!)/1.3)
        .attr('fill', '#5D43B14D')
        .attr('stroke', '#5D43B180')
        .attr('opacity', 0.7);

      drawVerticalConnectors(svgEl, visibleData, historicalData, x, y);
    }

    // Prepare selected data
    const line = d3
      .line<Bond>()
      .x((d) => x(d.date!))
      .y((d) => y(d.yield!))
      .defined((d) => d.yield != null)
      .curve(d3.curveMonotoneX);

    visibleData = data
      .filter((d) => d.date! >= xDomain[0] && d.date! <= xDomain[1])
      .sort((a, b) => a.date!.getTime() - b.date!.getTime());

    if (selectedRange !== 'current') {
      drawVerticalConnectors(svgEl, visibleData, historicalData, x, y);
    }

    // Draw main line
    svgEl
      .append('path')
      .datum(visibleData)
      .attr('fill', 'none')
      .attr('stroke', '#222B31') 
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,2')
      .attr('d', line);

    // Draw main dots (purple)
       svgEl
  .selectAll('.circle-current')
  .data(visibleData)
  .enter()
  .append('circle')
  .attr('class', 'circle-current')
  .attr('cx', (d) => x(d.date!))
  .attr('cy', (d) => y(d.yield!))
  .attr('r', (d) => r(d.size!) / 1.3)
  .attr('fill', '#5D43B1')
  .attr('opacity', 0.5)
  .attr('stroke', '#44386C')
  .attr('stroke-width', 1.5)
  .on('mouseover', function (event: MouseEvent, d: Bond) {
    d3.select(this)
      .transition()
      .duration(150)
      .attr('opacity', 1)
      .attr('fill', '#5D43B1');
    tooltip
      .style('opacity', 1)
      .html(generateTooltipHTML(d))
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 28}px`);
  })
  .on('mouseout', function () {
   
    d3.select(this)
      .transition()
      .duration(150)
      .attr('opacity', 0.5)
      .attr('fill', '#5D43B1');

    tooltip.style('opacity', 0);
  });

    // Optional labels
    svgEl
      .selectAll('.bond-label')
      .data(
        visibleData.filter((d) => {
          return (
            d.description.includes('NGERIA') &&
            (d.description.includes('2025') ||
              d.description.includes('2033') ||
              d.description.includes('2038') ||
              d.description.includes('2047') ||
              d.description.includes('2051'))
          );
        }),
      )
      .enter()
      .append('g')
      .attr('class', 'bond-label')
      .attr('transform', (d) => `translate(${x(d.date!)}, ${y(d.yield!) - 15})`)
      .append('text')
      .attr('font-size', '12px')
      .attr('font-weight', '400')
      .attr('fill', '#737373')
      .text((d) => d.description);
  }

  function drawZoombar() {
    if (!container || !data.length) return;

    width = container.clientWidth;
    const zoombarWidth = width - zoombarMargin.left - zoombarMargin.right;

    d3.select(zoombarSvg).selectAll('*').remove();

    const sortedData = [...data].sort((a, b) => a.date!.getTime() - b.date!.getTime());

    const x = d3
      .scaleTime()
      .domain(d3.extent(sortedData, (d) => d.date!) as [Date, Date])
      .range([0, zoombarWidth]);

    const y = d3
      .scaleLinear()
      .domain([
        Math.max(0, d3.min(sortedData, (d) => d.yield!)! - 1),
        d3.max(sortedData, (d) => d.yield!)! + 1,
      ])
      .range([zoombarHeight - zoombarMargin.top - zoombarMargin.bottom, 0]);

    const svgEl = d3
      .select(zoombarSvg)
      .attr('width', width)
      .attr('height', zoombarHeight)
      .append('g')
      .attr('transform', `translate(${zoombarMargin.left},${zoombarMargin.top})`);

    // Create background for the zoombar
    svgEl
      .append('rect')
      .attr('class', 'zoom-bg')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', zoombarWidth)
      .attr('height', zoombarHeight - zoombarMargin.top - zoombarMargin.bottom)
      .attr('fill', '#FFF').attr('stroke', '#EDEDED');

    // Draw simplified line in the zoombar
    const line = d3
      .line<Bond>()
      .x((d) => x(d.date!))
      .y((d) => y(d.yield!))
      .defined((d) => d.yield != null)
      .curve(d3.curveMonotoneX);

    // Draw simplified dots in the zoombar
      svgEl
      .selectAll('.mini-circle')
      .data(sortedData)
      .enter()
      .append('circle')
      .attr('class', 'mini-circle')
      .attr('cx', (d) => x(d.date!))
      .attr('cy', (d) => y(d.yield!))
      .attr('r', 2)
      .attr('fill', '#A3A3A3')
      .attr('opacity', 0.7);

    // Create the selection area
      const selectionRect = svgEl
      .append('rect')
      .attr('class', 'zoom-selection')
      .attr('x', zoombarWidth * zoomSelection.start)
      .attr('y', 0)
      .attr('width', zoombarWidth * (zoomSelection.end - zoomSelection.start))
      .attr('height', zoombarHeight - zoombarMargin.top - zoombarMargin.bottom)
      .attr('fill', '#EDEDED')
      .attr('fill-opacity', 0.5)
      .attr('stroke-width', 1);

    // Draw handles
    const handleWidth = 8;

    // Left handle
    const leftHandle = svgEl
      .append('g')
      .attr('class', 'zoom-handle left-handle')
      .attr('transform', `translate(${zoombarWidth * zoomSelection.start},0)`)
      .style('cursor', 'ew-resize');

     leftHandle
      .append('rect')
      .attr('x', -handleWidth / 2)
      .attr('y', 0)
      .attr('width', handleWidth)
      .attr('height', zoombarHeight - zoombarMargin.top - zoombarMargin.bottom)
      .attr('fill', '#DBDBDB')
      .attr('fill-opacity', 0.7);

    // Add a + icon to the left handle
    leftHandle
      .append('text')
      .attr('x', 0)
      .attr('y', (zoombarHeight - zoombarMargin.top - zoombarMargin.bottom) / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .text('⋮');

    // Right handle
    const rightHandle = svgEl
      .append('g')
      .attr('class', 'zoom-handle right-handle')
      .attr('transform', `translate(${zoombarWidth * zoomSelection.end},0)`)
      .style('cursor', 'ew-resize');

    rightHandle
      .append('rect')
      .attr('x', -handleWidth / 2)
      .attr('y', 0)
      .attr('width', handleWidth)
      .attr('height', zoombarHeight - zoombarMargin.top - zoombarMargin.bottom)
      .attr('fill', '#DBDBDB')
      .attr('fill-opacity', 0.7);

    // Add a + icon to the right handle
    rightHandle
      .append('text')
      .attr('x', 0)
      .attr('y', (zoombarHeight - zoombarMargin.top - zoombarMargin.bottom) / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#FFF')
      .text('⋮');

    // Add drag behavior for the left handle
    leftHandle.call(
      d3
        .drag<SVGGElement, unknown>()
        .on('drag', (event) => {
          const newStart = Math.max(0, Math.min(zoomSelection.end - 0.05, event.x / zoombarWidth));
          zoomSelection.start = newStart;
          leftHandle.attr('transform', `translate(${zoombarWidth * newStart},0)`);
          selectionRect
            .attr('x', zoombarWidth * newStart)
            .attr('width', zoombarWidth * (zoomSelection.end - newStart));
        })
        .on('end', () => updateZoom()),
    );

    // Add drag behavior for the right handle
    rightHandle.call(
      d3
        .drag<SVGGElement, unknown>()
        .on('drag', (event) => {
          const newEnd = Math.min(1, Math.max(zoomSelection.start + 0.05, event.x / zoombarWidth));
          zoomSelection.end = newEnd;
          rightHandle.attr('transform', `translate(${zoombarWidth * newEnd},0)`);
          selectionRect.attr('width', zoombarWidth * (newEnd - zoomSelection.start));
        })
        .on('end', () => updateZoom()),
    );

    // Add drag behavior for the selection area
    selectionRect.call(
      d3
        .drag<SVGRectElement, unknown>()
        .on('drag', (event) => {
          const width = zoomSelection.end - zoomSelection.start;
          const dx = event.dx / zoombarWidth;

          let newStart = zoomSelection.start + dx;
          let newEnd = zoomSelection.end + dx;

          if (newStart < 0) {
            newStart = 0;
            newEnd = width;
          }

          if (newEnd > 1) {
            newEnd = 1;
            newStart = 1 - width;
          }

          zoomSelection.start = newStart;
          zoomSelection.end = newEnd;

          selectionRect.attr('x', zoombarWidth * newStart).attr('width', zoombarWidth * width);

          leftHandle.attr('transform', `translate(${zoombarWidth * newStart},0)`);
          rightHandle.attr('transform', `translate(${zoombarWidth * newEnd},0)`);
        })
        .on('end', () => updateZoom()),
    );
  }

  function updateZoom() {
    const timeScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date!) as [Date, Date])
      .range([0, 1]);

    const startDate = timeScale.invert(zoomSelection.start);
    const endDate = timeScale.invert(zoomSelection.end);

    zoomState.domain = [startDate, endDate];
    drawChart();
  }

  function resetZoom() {
    zoomSelection = { start: 0, end: 1 };
    zoomState.domain = null;
    updateDataAndRedraw();
  }

  // Quick zoom presets
  function setZoomPreset(years: number) {
    const fullRange = originalXDomain || (d3.extent(data, (d) => d.date!) as [Date, Date]);
    const fullTimeSpan = fullRange[1].getTime() - fullRange[0].getTime();

    // For presets, we'll start from the earliest date and zoom to show just the number of years
    const targetTimeSpan = years * 365 * 24 * 60 * 60 * 1000;
    const newEnd = Math.min(1, targetTimeSpan / fullTimeSpan);

    zoomSelection = { start: 0, end: newEnd };
    updateZoom();
    drawZoombar();
  }

  onMount(() => {
    tooltip = d3
  .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('box-shadow', '0px 4px 12px rgba(0, 0, 0, 0.05)')
      .style('padding', '12px')
      .style('border', '1px solid #EDEDED')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    updateDataAndRedraw();

    const resizeObserver = new ResizeObserver(() => {
      updateDataAndRedraw();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      tooltip.remove();
    };
  });
  const unsubscribe = bondData.subscribe((value) => {
    if (value) {
      updateDataAndRedraw();
    }
  });

  onDestroy(unsubscribe);
</script>

<div class="flex border-b border-[#DBDBDB] pb-4 px-6">
  {#each availableRanges as range}
    <button
      on:click={() => {
        previousRange = selectedRange;
        selectedRange = range;
        resetZoom(); 
      }}
      class="border border-[#DBDBDB] bg-[#F5F5F5] px-3 py-1 text-xs13 font-medium hover:bg-[#FFF] {selectedRange === range
        ? 'bg-[#FFF] font-medium'
        : ''}"
    >
      {range.toUpperCase()}
    </button>
  {/each}
</div>

<div class="sm:flex sm:justify-center">
  <div class="w-full">
    <div bind:this={container} class="h-[450px] w-full">
      <svg bind:this={svg} class="h-full w-full" />
    </div>
    <div class="-mt-9 w-full">
      <svg bind:this={zoombarSvg} class="w-full" height="50" />
    </div>
      <div class="text-sm text-gray-500 mb-10">
        <Button on:click={resetZoom}>Reset Zoom</Button>
      </div>
  </div>
  <div class="w-full sm:w-[200px] border-l border-l-[#DBDBDB] pt-5 pl-2">   
    <h3 class="mb-2 text-sm font-medium">Legend</h3>
    <ul class="space-y-2 text-xs text-gray-600">
      <li class="flex items-center space-x-2">
        <span style="height: 12px; width: 12px; background: #5D43B1; margin: 0 10px 0 0px"></span>
        <span>Last</span>
      </li>
      <li class="flex items-center space-x-2">
        <span style="height: 12px; width: 12px; background: #5D43B1; margin: 0 10px 0 0px; opacity: 0.5"></span>
        <span>3 months ago</span>
      </li>
     
    </ul>
    
  </div>
</div>


