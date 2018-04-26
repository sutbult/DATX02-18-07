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
import Utils.State exposing
    ( with
    , foldMsg
    )

init : (Model, Cmd Msg)
init =
    let
        model =
            { filters = Dict.empty
            , filterOrder = []
            , selected = NoFilter
            , currencies =
                { from = []
                , to = []
                }
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
                in
                    ( newModel
                    , Platform.Cmd.map (ToInstance index) subCmd
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
                (subModelA, subCmdA) = InstanceState.init
                (subModelB, subCmdB) = InstanceState.update
                    (InstanceTypes.SetCurrencies
                        model.currencies.from
                        model.currencies.to
                    )
                    subModelA
                newIndex = Dict.size model.filters + 1
                newModel = { model
                    | filters = Dict.insert newIndex subModelB model.filters
                    , filterOrder = model.filterOrder ++ [newIndex]
                    , selected = FilterWithID newIndex
                    }
            in
                ( newModel
                , Platform.Cmd.map (ToInstance newIndex)
                    <| Cmd.batch
                        [ subCmdA
                        , subCmdB
                        ]
                )


subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none
