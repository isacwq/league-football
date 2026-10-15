package com.github.isacwq.leaguefootball.enums;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Formation {
  @JsonProperty("3-1")
  F_3_1("3-1"),

  @JsonProperty("2-2")
  F_2_2("2-2"),

  @JsonProperty("2-1-1")
  F_2_1_1("2-1-1"),

  @JsonProperty("1-2-1")
  F_1_2_1("1-2-1");

  private final String value;

  Formation(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }
}
