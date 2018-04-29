module BidList.Filter.State exposing
    ( init
    , update
    , subscriptions
    )

import Dict
import Platform.Cmd

import BidList.Filter.Types exposing (..)
import BidList.Filter.Instance.Types as InstanceTypes
import BidList.Filter.Instance.State as InstanceState
import BidList.Filter.Part.Types as PartTypes
import Utils.State exposing
    ( with
    , foldMsg
    )
import Ports

init : String -> (Model, Cmd Msg)
init id =
    let
        model =
            { filters = Dict.empty
            , filterOrder = []
            , selected = NoFilter
            , currencies =
                { from = []
                , to = []
                }
            , id = id
            }
    in
        (model, Cmd.none)


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        ToInstance index subMsg ->
            with model (Dict.get index model.filters) <| \filter ->
                let
                    (subModel, subCmd) = InstanceState.update subMsg filter
                    newModel = { model
                        | filters = Dict.insert index subModel model.filters
                        }
                    cmd = Platform.Cmd.map (ToInstance index) subCmd
                in
                    ( newModel
                    , Cmd.batch
                        [ cmd
                        , saveFilters newModel
                        ]
                    )

        SetCurrencies from to ->
            let
                subMsg = InstanceTypes.SetCurrencies from to
                folder filterID _ msgList =
                    ToInstance filterID subMsg :: msgList
                newModel = { model
                    | currencies =
                        { from = from
                        , to = to
                        }
                    }
            in
                foldMsg update newModel
                    <| Dict.foldl folder [] model.filters

        SelectFilter selected ->
            ( {model | selected = selected}
            , Cmd.none
            )

        NewFilter ->
            let
                newIndex = Dict.size model.filters + 1
                (subModelA, subCmdA) = InstanceState.init
                    <| "Filter #" ++ toString newIndex
                (subModelB, subCmdB) = InstanceState.update
                    (InstanceTypes.SetCurrencies
                        model.currencies.from
                        model.currencies.to
                    )
                    subModelA
                newModel = { model
                    | filters = Dict.insert newIndex subModelB model.filters
                    , filterOrder = model.filterOrder ++ [newIndex]
                    , selected = FilterWithID newIndex
                    }
                cmd =
                    Platform.Cmd.map (ToInstance newIndex)
                        <| Cmd.batch
                            [ subCmdA
                            , subCmdB
                            ]
            in
                ( newModel
                , Cmd.batch
                    [ cmd
                    , saveFilters newModel
                    ]
                )

        SetStoredFilters filters filterOrder ->
            let
                newModel = {model
                    | filters = filters
                    , filterOrder = filterOrder
                    }
            in
                (newModel, Cmd.none)

        Noop ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ filterSubscriptions model
        , storeSubscriptions model
        ]


filterSubscriptions : Model -> Sub Msg
filterSubscriptions model =
    let
        instanceSub filter =
            Sub.map (ToInstance <| Tuple.first filter)
                <| InstanceState.subscriptions
                <| Tuple.second filter
    in
        Sub.batch
            <| List.map instanceSub
            <| Dict.toList model.filters


storeSubscriptions : Model -> Sub Msg
storeSubscriptions model =
    let
        toMsg (origin, filters, filterOrder) =
            if origin /= model.id then
                SetStoredFilters
                    (Dict.map (\_ -> fromStoreFilter) <| Dict.fromList filters)
                    filterOrder
            else
                Noop
    in
        Ports.subFilters toMsg


saveFilters : Model -> Cmd Msg
saveFilters model =
    Ports.saveFilters
        ( model.id
        , Dict.toList <| Dict.map (\_ -> toStoreFilter) model.filters
        , model.filterOrder
        )


-- Store filter

toStoreFilter : InstanceTypes.Model -> StoreFilter
toStoreFilter model =
    let
        toPart part =
            StoreFilterPart
                part.title
                part.query
                <| Dict.toList part.elements
    in
        StoreFilter
            model.name
            (toPart model.from)
            (toPart model.to)


fromStoreFilter : StoreFilter -> InstanceTypes.Model
fromStoreFilter model =
    let
        fromPart part =
            PartTypes.Model
                part.title
                part.query
                <| Dict.fromList part.elements
    in
        InstanceTypes.Model
            model.name
            (fromPart model.from)
            (fromPart model.to)
