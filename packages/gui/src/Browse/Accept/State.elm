module Browse.Accept.State exposing
    ( init
    , update
    , subscriptions
    )

import Task

import Browse.Accept.Types exposing (..)
import Browse.Accept.Rest exposing (acceptBid)
import Ports
import Error.Types

init : (Model, Cmd Msg)
init =
    (   { modal = Nothing
        , processing = False
        , sseID = -1
        , mousePositions = []
        }
    , Cmd.none
    )


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        -- Modal
        DisplayModal bid ->
            ({model | modal = Just bid}, Cmd.none)

        CancelModal ->
            ({model | modal = Nothing}, Cmd.none)

        -- Accept bid
        AcceptBid bid ->
            if model.sseID >= 0 then
                ({model | processing = True}, acceptBid model bid)
            else
                (model, Cmd.none)

        EndProcessingBid ->
            ({model
                | processing = False
                , modal = Nothing
            }, Cmd.none)

        AcceptFailure error ->
            let
                (newModel, newCmd) = update EndProcessingBid model
            in
                ( newModel
                , Cmd.batch
                    [ newCmd
                    , Task.perform ToError (Task.succeed error)
                    ]
                )

        -- Misc
        GetSSEId id ->
            ({model | sseID = id}, Cmd.none)

        MouseMove x y ->
            ({model | mousePositions = (x, y) :: model.mousePositions}, Cmd.none)

        TriggerPassword _ _ _ _ ->
            (model, Cmd.none)

        Noop ->
            (model, Cmd.none)

        ToError _ ->
            (model, Cmd.none)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ processSubs model
        , mouseMoveSub
        ]


processSubs : Model -> Sub Msg
processSubs model =
    if model.sseID < 0 then
        Ports.getSSEId GetSSEId

    else if model.processing then
        Sub.batch
            [ Ports.acceptBidSuccess
                <| \_ -> EndProcessingBid

            , Ports.acceptBidFailure
                <| \error -> AcceptFailure
                <| Error.Types.Display "Exchange error"
                <| "The exchange failed with the error message '" ++ error ++ "'."
            ]

    else
        Sub.none


mouseMoveSub : Sub Msg
mouseMoveSub =
    Ports.mouseMove <| uncurry MouseMove
