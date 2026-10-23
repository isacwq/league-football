package com.github.isacwq.leaguefootball.services.impl;

import com.github.isacwq.leaguefootball.dtos.*;
import com.github.isacwq.leaguefootball.entities.PlayerEntity;
import com.github.isacwq.leaguefootball.enums.Condition;
import com.github.isacwq.leaguefootball.exceptions.BusinessRuleException;
import com.github.isacwq.leaguefootball.exceptions.InvalidParameterException;
import com.github.isacwq.leaguefootball.exceptions.ResourceNotFoundException;
import com.github.isacwq.leaguefootball.repositories.LineupRepository;
import com.github.isacwq.leaguefootball.repositories.PlayerRepository;
import com.github.isacwq.leaguefootball.repositories.PlayerSpecifications;
import com.github.isacwq.leaguefootball.services.PlayerService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação do ciclo de vida dos jogadores, validações de atributos, filtros e exclusão lógica.
 */
@Service
public class PlayerServiceImpl implements PlayerService {

  private final PlayerRepository playerRepository;
  private final LineupRepository lineupRepository;
  private final BusinessCalculatorService calculator;

  public PlayerServiceImpl(
      PlayerRepository playerRepository,
      LineupRepository lineupRepository,
      BusinessCalculatorService calculator) {
    this.playerRepository = playerRepository;
    this.lineupRepository = lineupRepository;
    this.calculator = calculator;
  }

  @Override
  @Transactional(readOnly = true)
  public PlayerListResponseDto findAll(PlayerFilterParamsDto filters) {
    // Tratamento de valores padrão se nulos
    int page = (filters.page() != null) ? filters.page() : 1;
    int limit = (filters.limit() != null) ? filters.limit() : 10;

    if (page < 1 || limit < 1 || limit > 50) {
      throw new InvalidParameterException("Parâmetros de paginação inválidos.");
    }
    // Validação de filtros contraditórios (RN07) [18, 19]
    if (Boolean.TRUE.equals(filters.free()) && filters.clubId() != null) {
      throw new InvalidParameterException("Não é permitido combinar free=true com club_id.");
    }
    if (filters.minAge() != null
        && filters.maxAge() != null
        && filters.minAge() > filters.maxAge()) {
      throw new InvalidParameterException("min_age não pode ser maior que max_age.");
    }

    // Construção da Specification JPA, Ordenação Segura e Paginação
    Specification<PlayerEntity> spec = PlayerSpecifications.buildFilter(filters);
    Sort sortOrder = parsePlayerSort(filters.sort());
    Pageable pageable = PageRequest.of(page - 1, limit, sortOrder);

    Page<PlayerEntity> entityPage = playerRepository.findAll(spec, pageable);
    var data = entityPage.getContent().stream().map(this::mapToResponseDto).toList();

    PageMetaDto meta =
        new PageMetaDto(page, limit, entityPage.getTotalElements(), entityPage.getTotalPages());
    return new PlayerListResponseDto(data, meta);
  }

  @Override
  @Transactional(readOnly = true)
  public PlayerResponseDto findById(Long id) {
    PlayerEntity player =
        playerRepository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Jogador não encontrado."));
    return mapToResponseDto(player);
  }

  @Override
  @Transactional
  public PlayerResponseDto create(CreatePlayerDto dto) {
    validateCreatePlayer(dto);

    int overall =
        calculator.calculateOverall(
            dto.position(),
            dto.pace(),
            dto.shooting(),
            dto.passing(),
            dto.dribbling(),
            dto.defending(),
            dto.physical());
    BigDecimal baseValue = calculator.calculateBaseValue(overall, dto.potential(), dto.age());

    PlayerEntity entity = new PlayerEntity();
    entity.setName(dto.name().trim().replaceAll("\\s+", " "));
    entity.setPosition(dto.position());
    entity.setAgility(dto.agility());
    entity.setAge(dto.age());
    entity.setPace(dto.pace());
    entity.setShooting(dto.shooting());
    entity.setPassing(dto.passing());
    entity.setDribbling(dto.dribbling());
    entity.setDefending(dto.defending());
    entity.setPhysical(dto.physical());
    entity.setPotential(dto.potential());
    entity.setBaseValue(baseValue);
    entity.setCondition(Condition.APTO); // Nasce livre e APTO [20, 21]

    PlayerEntity saved = playerRepository.save(entity);
    return mapToResponseDto(saved);
  }

  @Override
  @Transactional
  public PlayerResponseDto update(Long id, UpdatePlayerDto dto) {
    PlayerEntity player =
        playerRepository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Jogador não encontrado."));

    if (player.getClub() != null && !player.getPosition().equals(dto.position())) {
      throw new BusinessRuleException(
          "Jogador pertencente a um clube não pode alterar de posição."); // RN08 [22]
    }
    if (dto.age() < player.getAge()) {
      throw new BusinessRuleException("A idade do jogador não pode ser reduzida."); // RN08 [22]
    }

    player.setName(dto.name().trim().replaceAll("\\s+", " "));
    player.setPosition(dto.position());
    player.setAgility(dto.agility());
    player.setAge(dto.age());

    return mapToResponseDto(playerRepository.save(player));
  }

  @Override
  @Transactional // Atômico: altera condição e remove da escalação se passar a DOENTE [4, 5]
  public PlayerResponseDto updateCondition(Long id, UpdateConditionDto dto) {
    PlayerEntity player =
        playerRepository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Jogador não encontrado."));

    if (player.getCondition() == Condition.DOENTE && dto.condition() == Condition.APTO) {
      throw new BusinessRuleException(
          "Jogador com condição DOENTE não pode alterar diretamente para APTO."); // RN01/RN08 [23]
    }

    player.setCondition(dto.condition());

    if (dto.condition() == Condition.DOENTE) {
      lineupRepository.deleteByPlayerId(player.getId()); // Titular DOENTE sai da escalação [24]
    }

    return mapToResponseDto(playerRepository.save(player));
  }

  @Override
  @Transactional
  public void delete(Long id) {
    PlayerEntity player =
        playerRepository
            .findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Jogador não encontrado."));

    if (player.getClub() != null) {
      throw new BusinessRuleException(
          "Jogador pertencente a um clube não pode ser excluído."); // RN09 [25]
    }

    player.setDeletedAt(OffsetDateTime.now()); // Exclusão Lógica [25]
    playerRepository.save(player);
  }

  /**
   * Valida os dados de cadastro de jogador, verificando limites de campo
   *  e regras de consistência cruzada entre os atributos.
   *
   * <p>Não realiza persistência; apenas garante que o payload está dentro
   * das regras de negócio antes de avançar para a camada de acesso a dados.
   *
   * @param dto os dados de cadastro a serem validados
   * @throws InvalidParameterException se algum campo violar um limite ou uma
   *         regra cruzada
   */
  private void validateCreatePlayer(CreatePlayerDto dto) {
    // Validação e sanitização de nome (V4 e Limites)
    String name = dto.name().trim().replaceAll("\\s+", " ");
    if (name.length() < 3 || name.length() > 100) {
      throw new InvalidParameterException("O nome deve ter entre 3 e 100 caracteres.");
    }
    if (name.matches(".*\\d.*")) {
      throw new InvalidParameterException("O nome do jogador não pode conter dígitos.");
    }
    if (name.split(" ").length < 2) {
      throw new InvalidParameterException(
          "O nome do jogador deve conter pelo menos duas palavras.");
    }

    // Validação de Idade
    if (dto.age() < 16 || dto.age() > 45) {
      throw new InvalidParameterException("A idade deve estar entre 16 e 45 anos.");
    }

    // Validação de Agilidade (Limitação para idades >= 35)
    if (dto.agility() < 1 || dto.agility() > 100) {
      throw new InvalidParameterException("A agilidade deve estar entre 1 e 100.");
    }
    if (dto.age() >= 35 && dto.agility() > 85) {
      throw new InvalidParameterException(
          "Para jogadores com 35 anos ou mais, a agilidade não pode ultrapassar 85.");
    }

    // Validação dos Atributos Táticos (1 a 99)
    validateAttributeRange("velocidade", dto.pace());
    validateAttributeRange("finalização", dto.shooting());
    validateAttributeRange("passe", dto.passing());
    validateAttributeRange("drible", dto.dribbling());
    validateAttributeRange("defesa", dto.defending());
    validateAttributeRange("físico", dto.physical());

    // Regra da Soma dos Atributos <= 480
    int totalAttributes =
        dto.pace()
            + dto.shooting()
            + dto.passing()
            + dto.dribbling()
            + dto.defending()
            + dto.physical();
    if (totalAttributes > 480) {
      throw new InvalidParameterException(
          "A soma dos seis atributos táticos não pode ultrapassar 480 pontos.");
    }

    // Validação do Potencial (RN06)
    if (dto.potential() < 1 || dto.potential() > 99) {
      throw new InvalidParameterException("O potencial deve estar entre 1 e 99.");
    }

    int maxAttribute =
        Math.max(
            dto.pace(),
            Math.max(
                dto.shooting(),
                Math.max(
                    dto.passing(),
                    Math.max(dto.dribbling(), Math.max(dto.defending(), dto.physical())))));

    if (dto.potential() < maxAttribute) {
      throw new InvalidParameterException(
          "O potencial não pode ser menor que o maior dos seis atributos táticos.");
    }

    if (dto.age() >= 33 && !dto.potential().equals(maxAttribute)) {
      throw new InvalidParameterException(
          "Para jogadores com 33 anos ou mais, o potencial deve ser exatamente igual ao maior dos"
              + " seis atributos táticos.");
    }
  }

  private void validateAttributeRange(String name, Integer value) {
    if (value < 1 || value > 99) {
      throw new InvalidParameterException("O atributo '" + name + "' deve estar entre 1 e 99.");
    }
  }

  private Sort parsePlayerSort(@Nullable String sortParam) {
    if (sortParam == null || sortParam.isBlank()) {
      return Sort.by("name").ascending().and(Sort.by("id").ascending());
    }

    if (sortParam.contains("position")) {
      return Sort.unsorted();
    }

    String[] criteria = sortParam.split(",");
    Sort sortResult = Sort.unsorted();

    for (String criterion : criteria) {
      String trimmed = criterion.trim();
      Sort currentSort =
          switch (trimmed) {
            case "name" -> Sort.by("name").ascending();
            case "value_asc" -> Sort.by("baseValue").ascending();
            case "value_desc" -> Sort.by("baseValue").descending();
            case "age_asc" -> Sort.by("age").ascending();
            case "age_desc" -> Sort.by("age").descending();
            case "position" -> Sort.by("position").ascending();
            default ->
                throw new InvalidParameterException("Valor de ordenação inválido: " + trimmed);
          };
      sortResult = sortResult.and(currentSort);
    }

    return sortResult.and(Sort.by("id").ascending());
  }

  private PlayerResponseDto mapToResponseDto(PlayerEntity p) {
    int overall =
        calculator.calculateOverall(
            p.getPosition(),
            p.getPace(),
            p.getShooting(),
            p.getPassing(),
            p.getDribbling(),
            p.getDefending(),
            p.getPhysical());
    BigDecimal marketValue =
        calculator.calculateMarketValue(
            p.getBaseValue(), p.getCondition(), p.getAgility(), p.getAge());

    Long clubId = p.getClub() != null ? p.getClub().getId() : null;
    String clubName = p.getClub() != null ? p.getClub().getName() : null;

    return new PlayerResponseDto(
        p.getId(),
        p.getName(),
        p.getPosition(),
        p.getAgility(),
        p.getAge(),
        p.getPace(),
        p.getShooting(),
        p.getPassing(),
        p.getDribbling(),
        p.getDefending(),
        p.getPhysical(),
        p.getPotential(),
        overall,
        p.getBaseValue(),
        marketValue,
        p.getCondition(),
        clubId,
        clubName);
  }
}
