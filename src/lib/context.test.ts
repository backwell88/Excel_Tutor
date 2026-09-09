import { buildContextSnapshot, shouldReadWorkbookContext } from "./context";

describe("shouldReadWorkbookContext", () => {
  it("skips data reads for a generic shortcut question", () => {
    expect(shouldReadWorkbookContext("筛选快捷键是什么？")).toBe(false);
  });

  it("reads data when the question refers to the selected data", () => {
    expect(shouldReadWorkbookContext("我选中的这些数据怎么按月份汇总？")).toBe(true);
  });
});

describe("buildContextSnapshot", () => {
  it("includes formulas for a small selection", () => {
    const snapshot = buildContextSnapshot({
      worksheetName: "Sheet1",
      rangeAddress: "Sheet1!$A$1:$B$2",
      values: [["金额", "合计"], [100, 300]],
      formulas: [["金额", "合计"], [100, "=A2*3"]],
    });

    expect(snapshot.headers).toEqual(["金额", "合计"]);
    expect(snapshot.cells?.[3]).toEqual({ address: "B2", value: 300, formula: "=A2*3" });
  });

  it("samples an oversized selection instead of returning every cell", () => {
    const values = Array.from({ length: 201 }, (_, row) => ["Header", row]);
    const snapshot = buildContextSnapshot({
      worksheetName: "Sheet1",
      rangeAddress: "A1:B201",
      values,
      formulas: values,
    });

    expect(snapshot.sampled).toBe(true);
    expect(snapshot.cells).toBeUndefined();
    expect(snapshot.sample_rows).toHaveLength(30);
  });
});

